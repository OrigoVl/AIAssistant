<template>
  <draggable
    v-model="logicalBlocks"
    :key="`draggable-${conditionId}`"
    :list="logicalBlocks"
    handle=".conditional-draggable-list__drag-handle"
    group="logicalBlocks"
    item-key="ifBlocks.id"
    ghost-class="draggable-ghost"
    chosen-class="draggable-chosen"
    @end="handleDragEnd"
  >
    <template #item="{ element: currentCondition, index }">
      <ConditionalDraggableItem
        :condition="currentCondition"
        :index="index"
        :children-of-collection="childrenOfCollection"
        :allow-multiple="allowMultiple"
        :can-delete="logicalBlocks.length > 1"
        @update:condition="handleConditionUpdate"
        @delete="handleDelete"
        @reset="handleReset"
        @delete-logical-block="handleLogicalBlockDelete"
      />
    </template>
  </draggable>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api';
import draggable from 'vuedraggable';
import ConditionalDraggableItem from './ConditionalDraggableItem.vue';
import SobjectModel from '@acx-ohc/composer-online-shared/src/co-generator/model/SobjectModel';
import { LogicalBlock } from '@acx-ohc/composer-online-shared/src/types/conditional-values';

interface ConditionalDraggableListProps {
  logicalBlocks: LogicalBlock[];
  conditionId: string;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
}

interface ConditionalDraggableListEmits {
  'update:logical-blocks': [logicalBlocks: LogicalBlock[]];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'delete-logical-block': [conditionId: string, index: number];
  'order-change': [conditionId: string];
}

export default defineComponent({
  name: 'ConditionalDraggableList',
  components: {
    draggable,
    ConditionalDraggableItem,
  },

  props: {
    logicalBlocks: {
      type: Array as PropType<LogicalBlock[]>,
      required: true,
    },
    conditionId: {
      type: String,
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
  },

  emits: ['update:logical-blocks', 'delete', 'reset', 'delete-logical-block', 'order-change'],

  setup(props: ConditionalDraggableListProps, { emit }: { emit: ConditionalDraggableListEmits }) {
    const handleDragEnd = () => {
      emit('order-change', props.conditionId);
    };

    const handleConditionUpdate = (updates: any[]) => {
      // Update logic for individual conditions
      const updatedLogicalBlocks = props.logicalBlocks.map(block => {
        // Apply updates to the block
        return block;
      });
      emit('update:logical-blocks', updatedLogicalBlocks);
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

    return {
      handleDragEnd,
      handleConditionUpdate,
      handleDelete,
      handleReset,
      handleLogicalBlockDelete,
    };
  },
});
</script>

<style lang="scss">
.conditional-draggable-list {
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
  }
}

.draggable-ghost {
  opacity: 0.5;
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
}

.draggable-chosen {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}
</style>