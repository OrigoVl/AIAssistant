import { ref, Ref } from '@vue/composition-api';
import { Conditions, IfOperator, ActionOperator, LogicalBlock, IfBlock } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import { defaultLogicalBlock, defaultIfAction, defaultThenAction, defaultElseAction, cloneLogicalBlocksFromDefault } from '@/constants';
import { CONSTANTS } from '@/constants/conditional';

interface ConditionalLogicProps {
  conditions: Ref<Conditions[]>;
  allowMultiple: Ref<boolean>;
  parentEntityName: Ref<string>;
}

interface ConditionalLogicEmits {
  'update:conditions': (conditions: Conditions[]) => void;
}

/**
 * Type guards for better type safety
 */
const isIfOperator = (item: any): item is IfOperator => {
  return 'type' in item && (item.type === 'if' || item.type === 'else-if');
};

const isActionOperator = (item: any): item is ActionOperator => {
  return 'type' in item && item.type === 'then';
};

/**
 * Composable for handling conditional logic operations
 */
export function useConditionalLogic(props: ConditionalLogicProps, emit: ConditionalLogicEmits) {
  const currentConditionalValues = ref<Conditions[]>([]);

  /**
   * Handles the reordering of logical blocks within a condition
   * @param conditionId - The ID of the condition being reordered
   */
  const handleOrderChange = (conditionId: string) => () => {
    const updatedConditions: Conditions[] = props.conditions.value.map((cond) => {
      if (cond.id !== conditionId) return cond;

      const updatedLogicalBlocks: LogicalBlock[] = cond.logicalBlocks.map(
        (block, index) => {
          const updatedIfBlocks: IfBlock = {
            ...block.ifBlocks,
            ifOperators: block.ifBlocks.ifOperators.map((op) => ({
              ...op,
              type: index === 0 ? 'if' : 'else-if',
            })),
          };

          return {
            ...block,
            ifBlocks: updatedIfBlocks,
          };
        }
      );

      return {
        ...cond,
        logicalBlocks: updatedLogicalBlocks,
      };
    });

    currentConditionalValues.value = updatedConditions;
    emit('update:conditions', updatedConditions);
  };

  /**
   * Adds a new else-if block to a condition
   * @param conditionId - The ID of the condition to add the else-if block to
   */
  const addElseIfBlock = (conditionId: string) => {
    const updatedConditions = [...props.conditions.value];

    const conditionIndex = updatedConditions.findIndex(
      (cond) => cond.id === conditionId
    );

    if (conditionIndex === -1) return;

    const targetCondition = { ...updatedConditions[conditionIndex] };

    const baseEntity =
      targetCondition.logicalBlocks[0]?.ifBlocks.ifOperators[0]?.entity || {};

    const newElseIfBlock = defaultLogicalBlock(true, baseEntity);

    targetCondition.logicalBlocks = [
      ...targetCondition.logicalBlocks,
      newElseIfBlock,
    ];

    updatedConditions[conditionIndex] = targetCondition;

    currentConditionalValues.value = updatedConditions;
    emit('update:conditions', currentConditionalValues.value);
  };

  /**
   * Handles deletion of conditions or logical blocks
   * @param id - The ID of the item to delete
   * @param type - The type of deletion ('allBlocks' or 'oneBlock')
   */
  const handleDelete = (id: string, type: 'allBlocks' | 'oneBlock'): void => {
    if (type === 'allBlocks') {
      return emit(
        'update:conditions',
        props.conditions.value.map((rule) => {
          if (rule.id !== id) return rule;
          return {
            ...rule,
            logicalBlocks: [],
          };
        })
      );
    } else {
      const reducedConditions = props.conditions.value.map((rule) => ({
        ...rule,
        logicalBlocks: rule.logicalBlocks.map((logicalBlock) => ({
          ...logicalBlock,
          ifBlocks: {
            ...logicalBlock.ifBlocks,
            ifOperators: logicalBlock.ifBlocks.ifOperators.filter(
              (op) => op.id !== id
            ),
          },
          thenBlocks: {
            ...logicalBlock.thenBlocks,
            thenOperators: logicalBlock.thenBlocks.thenOperators.filter(
              (op) => op.id !== id
            ),
          },
        })),
        elseBlocks: rule.elseBlocks.filter((block) => block.id !== id),
      }));
      return emit('update:conditions', reducedConditions);
    }
  };

  /**
   * Handles deletion of logical blocks
   * @param conditionId - The ID of the condition
   * @param elseIfIndex - The index of the else-if block to delete
   */
  const handleLogicalBlockDelete = (conditionId: string, elseIfIndex: number) => {
    if (elseIfIndex < 1) {
      console.warn('Cannot delete the primary "if" block.');
      return;
    }

    const updatedConditions = [...currentConditionalValues.value];

    const conditionIndex = updatedConditions.findIndex(
      (cond) => cond.id === conditionId
    );

    if (conditionIndex === -1) return;

    const targetCondition = { ...updatedConditions[conditionIndex] };
    const logicalBlocks = [...targetCondition.logicalBlocks];

    if (elseIfIndex >= logicalBlocks.length) return;

    logicalBlocks.splice(elseIfIndex, 1);

    targetCondition.logicalBlocks = logicalBlocks;
    updatedConditions[conditionIndex] = targetCondition;

    currentConditionalValues.value = updatedConditions;
    emit('update:conditions', currentConditionalValues.value);
  };

  /**
   * Handles reset operations for conditions
   * @param id - The ID or object to reset
   */
  const handleReset = (id: string | IfOperator | ActionOperator | any): void => {
    if (typeof id === 'string') {
      emit('update:conditions', resetLogicalBlocks(id));
      return;
    }
    if (
      currentConditionalValues.value.length === 0 &&
      props.conditions.value.length === 0
    )
      return;

    switch (id.type) {
      case 'if':
        emit('update:conditions', resetIfOperators(id.id));
        break;
      case 'then':
        emit('update:conditions', resetThenOperators(id.id));
        break;
      case 'else':
        emit('update:conditions', resetElseBlocks(id.id));
        break;
    }
  };

  /**
   * Resets logical blocks to default state
   */
  function resetLogicalBlocks(id: string): Conditions[] {
    return props.conditions.value.map((condition) => {
      if (condition.id !== id) return condition;

      return {
        ...condition,
        logicalBlocks: cloneLogicalBlocksFromDefault(),
      };
    });
  }

  /**
   * Resets if operators to default state
   */
  function resetIfOperators(id: string): Conditions[] {
    return (currentConditionalValues.value = props.conditions.value.map(
      (condition) => ({
        ...condition,
        logicalBlocks: condition.logicalBlocks.map((logicalBlock) => {
          const containsOperator = logicalBlock.ifBlocks.ifOperators.some(
            (op) => op.id === id
          );
          return containsOperator
            ? {
                ...logicalBlock,
                ifBlocks: {
                  ...logicalBlock.ifBlocks,
                  ifOperators: [defaultIfAction()],
                },
              }
            : logicalBlock;
        }),
      })
    ));
  }

  /**
   * Resets then operators to default state
   */
  const resetThenOperators = (id: string): Conditions[] => {
    return (currentConditionalValues.value = props.conditions.value.map(
      (condition) => ({
        ...condition,
        logicalBlocks: condition.logicalBlocks.map((logicalBlock) => {
          const containsOperator = logicalBlock.thenBlocks.thenOperators.some(
            (op) => op.id === id
          );
          return containsOperator
            ? {
                ...logicalBlock,
                thenBlocks: {
                  ...logicalBlock.thenBlocks,
                  thenOperators: [defaultThenAction()],
                },
              }
            : logicalBlock;
        }),
      })
    ));
  };

  /**
   * Resets else blocks to default state
   */
  const resetElseBlocks = (id: string): Conditions[] => {
    return (currentConditionalValues.value = props.conditions.value.map(
      (condition) => {
        const updatedElseBlocks = condition.elseBlocks.map((operator) =>
          operator.id === id ? defaultElseAction() : operator
        );
        return {
          ...condition,
          elseBlocks: updatedElseBlocks,
        };
      }
    ));
  };

  /**
   * Updates condition logic with new values
   */
  const handleConditionUpdate = (updates: (IfOperator | ActionOperator)[]) => {
    const updatedConditions = props.conditions.value.map((conditionGroup) => {
      let updatedLogicalBlocks = [...conditionGroup.logicalBlocks];

      for (const condition of updates) {
        if (isIfOperator(condition)) {
          updatedLogicalBlocks = updateIfOperators(condition, updatedLogicalBlocks);
        } else if (isActionOperator(condition)) {
          updatedLogicalBlocks = updateActionOperators(condition, updatedLogicalBlocks);
        }
      }

      return {
        ...conditionGroup,
        logicalBlocks: updatedLogicalBlocks,
      };
    });

    currentConditionalValues.value = updatedConditions;
    emit('update:conditions', updatedConditions);
  };

  /**
   * Updates if operators with new entity data
   */
  const updateIfOperators = (condition: IfOperator, logicalBlocks: LogicalBlock[]) => {
    return logicalBlocks.map((block) => {
      const updatedIfOperators = block.ifBlocks.ifOperators.map((op) => ({
        ...op,
        entity: condition.entity,
      }));

      return {
        ...block,
        ifBlocks: {
          ...block.ifBlocks,
          ifOperators: updatedIfOperators,
        },
      };
    });
  };

  /**
   * Updates action operators
   */
  const updateActionOperators = (condition: ActionOperator, logicalBlocks: LogicalBlock[]) => {
    return logicalBlocks.map((block) => {
      if (block.ifBlocks.id === condition.id) {
        return {
          ...block,
          ifBlocks: {
            ...block.ifBlocks,
            ifOperators: [condition as IfOperator],
          },
        };
      }
      return block;
    });
  };

  return {
    currentConditionalValues,
    handleOrderChange,
    addElseIfBlock,
    handleDelete,
    handleLogicalBlockDelete,
    handleReset,
    handleConditionUpdate,
  };
}