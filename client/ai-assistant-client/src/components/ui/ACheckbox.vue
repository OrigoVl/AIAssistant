<template>
  <label :class="['checkbox-label', { 'checkbox-label--error': hasError }]">
    <input
      :id="id"
      :value="value"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      type="checkbox"
      :disabled="disabled"
      class="checkbox"
      v-bind="$attrs"
    />
    <span class="checkbox-text">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label: string
  value?: string
  id?: string
  disabled?: boolean
  hasError?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  hasError: false
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.checkbox-label:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
}

.checkbox-label:has(.checkbox:checked) {
  border-color: #3b82f6;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.checkbox-label--error {
  border-color: #ef4444;
}

.checkbox-label--error:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.checkbox:checked {
  transform: scale(1.2);
}

.checkbox:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: scale(1);
}

.checkbox-text {
  flex: 1;
  user-select: none;
}
</style> 