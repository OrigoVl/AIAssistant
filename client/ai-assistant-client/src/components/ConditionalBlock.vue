<template>
  <div class="conditional-block">
    <ConditionalDraggableList
      :logical-blocks="condition.logicalBlocks"
      :condition-id="condition.id"
      :children-of-collection="childrenOfCollection"
      :allow-multiple="allowMultiple"
      @update:logical-blocks="handleLogicalBlocksUpdate"
      @delete="handleDelete"
      @reset="handleReset"
      @delete-logical-block="handleLogicalBlockDelete"
      @order-change="handleOrderChange"
    />
    
    <ConditionalActions
      :can-add-else-if="canAddElseIf"
      :condition-id="condition.id"
      @add-else-if="$emit('add-else-if', condition.id)"
    />
    
    <ConditionalListItem
      :condition="condition.elseBlocks"
      title="else"
      condition-type="else"
      description="Content remains unchanged."
      :children-of-collection="childrenOfCollection"
      :is-open="isItemOpen(condition.id)"
      @toggle="toggleItem(condition.id)"
      @update:condition="handleElseUpdate"
      @delete="handleDelete"
      @reset="handleReset"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api';
import { useConditionalItemState } from '@/composables/useConditionalItemState';
import ConditionalDraggableList from './ConditionalDraggableList.vue';
import ConditionalActions from './ConditionalActions.vue';
import ConditionalListItem from './ConditionalListItem.vue';
import SobjectModel from '@acx-ohc/composer-online-shared/src/co-generator/model/SobjectModel';
import { Conditions, LogicalBlock } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import { CONSTANTS } from '@/constants/conditional';

interface ConditionalBlockProps {
  condition: Conditions;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
  isDeleteAvailable: boolean;
}

interface ConditionalBlockEmits {
  'update:condition': [condition: Conditions];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'add-else-if': [conditionId: string];
  'delete-logical-block': [conditionId: string, index: number];
  'order-change': [conditionId: string];
}

export default defineComponent({
  name: 'ConditionalBlock',
  components: {
    ConditionalDraggableList,
    ConditionalActions,
    ConditionalListItem,
  },

  props: {
    condition: {
      type: Object as PropType<Conditions>,
      required: true,
    },
    childrenOfCollection: {
      type: Array as PropType<SobjectModel[]>,
      required: true,
    },
    allowMultiple: {
      type: Boolean,
      required: true,
    },
    isDeleteAvailable: {
      type: Boolean,
      required: true,
    },
  },

  emits: ['update:condition', 'delete', 'reset', 'add-else-if', 'delete-logical-block', 'order-change'],

  setup(props: ConditionalBlockProps, { emit }: { emit: ConditionalBlockEmits }) {
    const { isItemOpen, toggleItem } = useConditionalItemState(props.allowMultiple);

    const canAddElseIf = computed(() => 
      props.condition.logicalBlocks.length < CONSTANTS.MAX_LOGICAL_BLOCKS
    );

    const handleLogicalBlocksUpdate = (logicalBlocks: LogicalBlock[]) => {
      const updatedCondition = {
        ...props.condition,
        logicalBlocks,
      };
      emit('update:condition', updatedCondition);
    };

    const handleElseUpdate = (elseBlocks: any[]) => {
      const updatedCondition = {
        ...props.condition,
        elseBlocks,
      };
      emit('update:condition', updatedCondition);
    };

    const handleDelete = (id: string, type: 'allBlocks' | 'oneBlock') => {
      emit('delete', id, type);
    };

    const handleReset = (id: string | any) => {
      emit('reset', id);
    };

    const handleLogicalBlockDelete = (conditionId: string, index: number) => {
      emit('delete-logical-block', conditionId, index);
    };

    const handleOrderChange = (conditionId: string) => {
      emit('order-change', conditionId);
    };

    return {
      isItemOpen,
      toggleItem,
      canAddElseIf,
      handleLogicalBlocksUpdate,
      handleElseUpdate,
      handleDelete,
      handleReset,
      handleLogicalBlockDelete,
      handleOrderChange,
    };
  },
});
</script>

<style lang="scss">
.conditional-block {
  margin-bottom: 20px;
}
</style>