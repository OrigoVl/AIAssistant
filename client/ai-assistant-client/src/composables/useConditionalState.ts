import { computed, Ref } from '@vue/composition-api';
import { Conditions } from '@acx-ohc/composer-online-shared/src/types/conditional-values';

interface ConditionalStateProps {
  conditions: Ref<Conditions[]>;
  allowMultiple: Ref<boolean>;
}

/**
 * Composable for managing conditional state
 */
export function useConditionalState(props: ConditionalStateProps) {
  /**
   * Computed property to determine if delete functionality is available
   */
  const isDeleteAvailable = computed(() => {
    return props.conditions.value.length > 1;
  });

  /**
   * Computed property to check if there are multiple logical blocks
   */
  const hasMultipleLogicalBlocks = computed(() => 
    props.conditions.value.some(condition => condition.logicalBlocks.length > 1)
  );

  /**
   * Computed property to get the total number of conditions
   */
  const totalConditions = computed(() => props.conditions.value.length);

  /**
   * Computed property to check if any condition has the maximum number of logical blocks
   */
  const hasMaxLogicalBlocks = computed(() => 
    props.conditions.value.some(condition => condition.logicalBlocks.length >= 9)
  );

  return {
    isDeleteAvailable,
    hasMultipleLogicalBlocks,
    totalConditions,
    hasMaxLogicalBlocks,
  };
}