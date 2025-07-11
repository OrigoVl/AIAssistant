<template>
  <div
    v-if="canAddElseIf"
    class="conditional-actions"
    data-testid="conditional-actions"
  >
    <ConditionalButton
      text="+ Add ELSE-IF"
      @click="$emit('add-else-if', conditionId)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import ConditionalButton from './ConditionalButton.vue';

interface ConditionalActionsProps {
  canAddElseIf: boolean;
  conditionId: string;
}

interface ConditionalActionsEmits {
  'add-else-if': [conditionId: string];
}

export default defineComponent({
  name: 'ConditionalActions',
  components: {
    ConditionalButton,
  },

  props: {
    canAddElseIf: {
      type: Boolean,
      required: true,
    },
    conditionId: {
      type: String,
      required: true,
    },
  },

  emits: ['add-else-if'],

  setup() {
    return {};
  },
});
</script>

<style lang="scss">
.conditional-actions {
  border-radius: 0 0 var(--border-radius, 8px) var(--border-radius, 8px);
  padding: var(--spacing, 10px) 40px;
  background-color: var(--background-color, var(--background-table-row));
  margin: 10px 0 20px;
}
</style>