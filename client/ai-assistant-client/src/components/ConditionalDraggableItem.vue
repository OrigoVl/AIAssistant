<template>
  <div
    class="conditional-draggable-item"
    :class="{
      'conditional-draggable-item--multiple': logicalBlocks.length > 1,
    }"
    data-testid="conditional-draggable-item"
  >
    <!-- Drag Handle -->
    <div
      v-if="logicalBlocks.length > 1"
      class="conditional-draggable-item__drag-handle"
      role="button"
      :aria-label="`Drag ${index === 0 ? 'if' : 'else-if'} condition`"
      tabindex="0"
      @keydown.enter.prevent
      @keydown.space.prevent
    >
      <img
        :style="{ opacity: CONSTANTS.DEFAULT_OPACITY }"
        width="16"
        height="16"
        src="@/assets/icons/burger-menu.svg"
        alt="Drag handle"
      />
    </div>

    <!-- Condition Content -->
    <div class="conditional-draggable-item__content">
      <ConditionalListItem
        class="conditional-draggable-item__if-block"
        :children-of-collection="childrenOfCollection"
        :condition="currentCondition.ifBlocks.ifOperators"
        :title="index === 0 ? 'if' : 'ELSE-IF'"
        :condition-type="index === 0 ? 'if' : 'else-if'"
        :is-open="isItemOpen(currentCondition.ifBlocks.id)"
        @toggle="toggleItem(currentCondition.ifBlocks.id)"
        @update:condition="handleIfUpdate"
        @delete="handleDelete"
        @reset="handleReset"
      />
      
      <ConditionalListItem
        :children-of-collection="childrenOfCollection"
        :condition="currentCondition.thenBlocks.thenOperators"
        title="then"
        condition-type="then"
        description="Content remains unchanged."
        :is-open="isItemOpen(currentCondition.thenBlocks.id)"
        @toggle="toggleItem(currentCondition.thenBlocks.id)"
        @update:condition="handleThenUpdate"
        @delete="handleDelete"
        @reset="handleReset"
      />
    </div>

    <!-- Delete Button -->
    <div
      v-if="canDelete"
      :class="`conditional-draggable-item__delete-button conditional-draggable-item__delete-button--${
        index !== 0 ? 'clickable' : 'non-clickable'
      }`"
      role="button"
      :aria-label="`Delete ${index === 0 ? 'if' : 'else-if'} condition`"
      tabindex="0"
      @click="handleDeleteClick"
      @keydown.enter="handleDeleteClick"
      @keydown.space="handleDeleteClick"
    >
      <font-awesome-icon icon="trash" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api';
import { useConditionalItemState } from '@/composables/useConditionalItemState';
import ConditionalListItem from './ConditionalListItem.vue';
import SobjectModel from '@acx-ohc/composer-online-shared/src/co-generator/model/SobjectModel';
import { LogicalBlock } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import { CONSTANTS } from '@/constants/conditional';

interface ConditionalDraggableItemProps {
  condition: LogicalBlock;
  index: number;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
  canDelete: boolean;
}

interface ConditionalDraggableItemEmits {
  'update:condition': [updates: any[]];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'delete-logical-block': [conditionId: string, index: number];
}

export default defineComponent({
  name: 'ConditionalDraggableItem',
  components: {
    ConditionalListItem,
  },

  props: {
    condition: {
      type: Object as PropType<LogicalBlock>,
      required: true,
    },
    index: {
      type: Number,
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
    canDelete: {
      type: Boolean,
      required: true,
    },
  },

  emits: ['update:condition', 'delete', 'reset', 'delete-logical-block'],

  setup(props: ConditionalDraggableItemProps, { emit }: { emit: ConditionalDraggableItemEmits }) {
    const { isItemOpen, toggleItem } = useConditionalItemState(props.allowMultiple);

    const currentCondition = computed(() => props.condition);
    const logicalBlocks = computed(() => [props.condition]); // For template compatibility

    const handleIfUpdate = (updates: any[]) => {
      emit('update:condition', updates);
    };

    const handleThenUpdate = (updates: any[]) => {
      emit('update:condition', updates);
    };

    const handleDelete = (id: string, type: 'allBlocks' | 'oneBlock') => {
      emit('delete', id, type);
    };

    const handleReset = (id: string | any) => {
      emit('reset', id);
    };

    const handleDeleteClick = () => {
      if (props.index === 0) {
        console.warn('Cannot delete the primary "if" block.');
        return;
      }
      emit('delete-logical-block', props.condition.ifBlocks.id, props.index);
    };

    return {
      currentCondition,
      logicalBlocks,
      isItemOpen,
      toggleItem,
      handleIfUpdate,
      handleThenUpdate,
      handleDelete,
      handleReset,
      handleDeleteClick,
      CONSTANTS,
    };
  },
});
</script>

<style lang="scss">
.conditional-draggable-item {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  border: 1px solid var(--border-color, #dadce1);
  border-radius: var(--border-radius, 8px);
  padding: 8px 0;

  &--multiple {
    // Additional styles for multiple items
  }

  &__drag-handle {
    cursor: grab;
    flex: 0 0 auto;
    margin: 10px;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      cursor: grabbing;
    }

    &:focus {
      outline: 2px solid #2196f3;
      outline-offset: 2px;
    }
  }

  &__content {
    flex: 1 1 auto;
  }

  &__if-block {
    margin-bottom: 8px;
  }

  &__delete-button {
    flex: 0 0 auto;
    margin: 13px;
    font-size: 18px;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &--clickable {
      cursor: pointer;
      color: #d32f2f;

      &:hover {
        background-color: rgba(211, 47, 47, 0.1);
        transform: scale(1.1);
      }

      &:focus {
        outline: 2px solid #d32f2f;
        outline-offset: 2px;
      }
    }

    &--non-clickable {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 768px) {
  .conditional-draggable-item {
    flex-direction: column;
    align-items: stretch;

    &__drag-handle {
      align-self: flex-start;
      margin: 5px;
    }

    &__delete-button {
      align-self: flex-end;
      margin: 5px;
    }
  }
}
</style>