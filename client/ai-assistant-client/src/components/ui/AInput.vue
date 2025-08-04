<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['form-input', { 'form-input--error': hasError }]"
      v-bind="$attrs"
    />
    <span v-if="hasError" class="form-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  id?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  hasError: false,
  errorMessage: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.form-group {
  margin-bottom: var(--space-6);
  position: relative;
}

.form-input {
  width: 100%;
  padding: var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  color: var(--color-text);
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.form-input:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-input--error {
  border-color: #ef4444;
}

.form-input--error:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.form-input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), 0 4px 12px rgba(239, 68, 68, 0.2);
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  font-weight: var(--font-weight-medium);
}
</style> 