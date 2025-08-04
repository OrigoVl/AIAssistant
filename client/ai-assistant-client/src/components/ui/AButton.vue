<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      { 'btn--loading': loading, 'btn--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    v-bind="$attrs"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: var(--font-size-sm);
  min-height: 44px;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn:hover:not(.btn--disabled)::before {
  left: 100%;
}

.btn--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn--primary:hover:not(.btn--disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn--primary:active:not(.btn--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn--secondary {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn--secondary:hover:not(.btn--disabled) {
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.btn--secondary:active:not(.btn--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn--danger:hover:not(.btn--disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn--danger:active:not(.btn--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn--loading {
  cursor: wait;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 