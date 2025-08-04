<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="['form-textarea', { 'form-textarea--error': hasError }]"
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
  placeholder?: string
  disabled?: boolean
  rows?: number
  hasError?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  rows: 4,
  hasError: false,
  errorMessage: '',
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

.form-textarea {
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
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.form-textarea:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 12px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
}

.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-textarea--error {
  border-color: #ef4444;
}

.form-textarea--error:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.form-textarea--error:focus {
  border-color: #dc2626;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.1),
    0 4px 12px rgba(239, 68, 68, 0.2);
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  font-weight: var(--font-weight-medium);
}
</style>
