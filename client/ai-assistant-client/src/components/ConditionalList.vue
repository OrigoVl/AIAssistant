<template>
  <div class="conditional-list__container">
    <div v-if="isLoading" class="conditional-list__spinner-container">
      <ASpinner :size="CONSTANTS.SPINNER_SIZE" />
    </div>
    <template v-else>
      <ConditionalBlock
        v-for="condition in conditions"
        :key="`condition-${condition.id}`"
        :condition="condition"
        :children-of-collection="childrenOfCollection"
        :allow-multiple="allowMultiple"
        :is-delete-available="isDeleteAvailable"
        @update:condition="handleConditionUpdate"
        @delete="handleDelete"
        @reset="handleReset"
        @add-else-if="addElseIfBlock"
        @delete-logical-block="handleLogicalBlockDelete"
        @order-change="handleOrderChange"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onBeforeMount, computed } from '@vue/composition-api';
import { useConditionalLogic } from '@/composables/useConditionalLogic';
import { useConditionalState } from '@/composables/useConditionalState';
import { useConditionalValidation } from '@/composables/useConditionalValidation';
import ConditionalBlock from './ConditionalBlock.vue';
import { GenerationContextService } from '@/services';
import SobjectModel from '@acx-ohc/composer-online-shared/src/co-generator/model/SobjectModel';
import { Conditions } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import { CONSTANTS } from '@/constants/conditional';

interface ConditionalListProps {
  conditions: Conditions[];
  allowMultiple?: boolean;
  parentEntityName: string;
}

interface ConditionalListEmits {
  'update:conditions': [conditions: Conditions[]];
}

export default defineComponent({
  name: 'ConditionalList',
  components: {
    ConditionalBlock,
  },

  props: {
    conditions: {
      type: Array as PropType<Conditions[]>,
      required: true,
      validator: (value: Conditions[]) => {
        return value.every(condition => 
          condition.logicalBlocks.length > 0 && 
          condition.logicalBlocks.length <= CONSTANTS.MAX_LOGICAL_BLOCKS
        );
      }
    },
    allowMultiple: {
      type: Boolean,
      default: true,
    },
    parentEntityName: {
      type: String,
      required: true,
    },
  },

  emits: ['update:conditions'],

  setup(props: ConditionalListProps, { emit }: { emit: ConditionalListEmits }) {
    const childrenOfCollection = ref<SobjectModel[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Composables
    const { 
      handleConditionUpdate, 
      handleDelete, 
      handleReset, 
      addElseIfBlock, 
      handleLogicalBlockDelete, 
      handleOrderChange 
    } = useConditionalLogic(props, emit);

    const { isDeleteAvailable } = useConditionalState(props);
    const { validateConditions } = useConditionalValidation();

    /**
     * Fetches parent entity data for the conditional logic
     */
    const getParentEntity = async (): Promise<void> => {
      try {
        const allEntities = await GenerationContextService.getContextService().getEntities();
        const metadata = await GenerationContextService.getContextService().getEntityFields(
          props.parentEntityName
        );
        
        childrenOfCollection.value = await GenerationContextService.getContextService().extractMetadata(
          metadata,
          {
            addCollections: false,
            addFields: true,
            addRelations: false,
            allEntities: allEntities,
            fieldType: ['text', 'boolean'],
          }
        );
      } catch (err) {
        error.value = 'Failed to load entity data';
        console.error('Error loading parent entity:', err);
      }
    };

    onBeforeMount(async () => {
      isLoading.value = true;
      await getParentEntity();
      isLoading.value = false;
    });

    return {
      childrenOfCollection,
      isLoading,
      error,
      isDeleteAvailable,
      handleConditionUpdate,
      handleDelete,
      handleReset,
      addElseIfBlock,
      handleLogicalBlockDelete,
      handleOrderChange,
      CONSTANTS,
    };
  },
});
</script>

<style lang="scss">
.conditional-list {
  --border-radius: 8px;
  --spacing: 10px;
  --border-color: #dadce1;
  --background-color: var(--background-table-row);

  &__container {
    height: 100%;
  }

  &__spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  &__error {
    padding: var(--spacing);
    margin: var(--spacing);
    border-radius: var(--border-radius);
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
  }
}

@media (max-width: 768px) {
  .conditional-list {
    &__container {
      padding: 0 var(--spacing);
    }
  }
}
</style>