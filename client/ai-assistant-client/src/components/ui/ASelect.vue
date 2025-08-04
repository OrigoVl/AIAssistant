<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :disabled="disabled"
      :class="['form-select', { 'form-select--error': hasError }]"
      v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <span v-if="hasError" class="form-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string
  label?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  options: SelectOption[]
  hasError?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
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

.form-select {
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
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: calc(var(--space-4) + 24px);
  cursor: pointer;
  background-color: transparent;
}

.form-select::-ms-expand {
  display: none;
}

/* Ensure no additional chevrons appear */
.form-select option {
  background: var(--color-surface);
  color: var(--color-text);
}

.form-select:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-select--error {
  border-color: #ef4444;
}

.form-select--error:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

.form-select--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), 0 4px 12px rgba(239, 68, 68, 0.2);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23dc2626' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  font-weight: var(--font-weight-medium);
}
</style> 