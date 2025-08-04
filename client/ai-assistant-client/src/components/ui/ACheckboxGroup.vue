<template>
  <div class="checkbox-group">
    <label v-if="label" class="checkbox-group-label">{{ label }}</label>
    <div class="checkbox-group-container">
      <ACheckbox
        v-for="option in options"
        :key="option.value"
        :id="`${id}-${option.value}`"
        :label="option.label"
        :value="option.value"
        :model-value="modelValue.includes(option.value)"
        :disabled="disabled || option.disabled"
        :has-error="hasError"
        @update:model-value="(checked) => handleCheckboxChange(option.value, checked)"
      />
    </div>
    <span v-if="hasError" class="form-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import ACheckbox from './ACheckbox.vue'

interface CheckboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string[]
  label?: string
  id?: string
  options: CheckboxOption[]
  disabled?: boolean
  hasError?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hasError: false,
  errorMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const handleCheckboxChange = (value: string, checked: boolean) => {
  const newValue = [...props.modelValue]
  
  if (checked && !newValue.includes(value)) {
    newValue.push(value)
  } else if (!checked && newValue.includes(value)) {
    const index = newValue.indexOf(value)
    newValue.splice(index, 1)
  }
  
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.checkbox-group {
  margin-bottom: var(--space-6);
}

.checkbox-group-label {
  display: block;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.checkbox-group-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.checkbox-group-container:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
  font-weight: var(--font-weight-medium);
}
</style> 