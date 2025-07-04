<template>
  <Transition
    name="warning-slide"
    enter-active-class="warning-enter-active"
    leave-active-class="warning-leave-active"
    enter-from-class="warning-enter-from"
    leave-to-class="warning-leave-to"
  >
    <div v-if="show" class="validation-warning-overlay">
      <div class="validation-warning">
        <div class="warning-container">
          <div class="warning-header">
            <div class="warning-icon-wrapper">
              <svg 
                class="warning-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="warning-content">
              <h4 class="warning-title">{{ validationResult?.warning }}</h4>
              <div v-if="validationResult?.suggestions && validationResult.suggestions.length > 0" class="suggestions">
                <div class="suggestions-title">💡 Рекомендації для покращення запиту:</div>
                <ul class="suggestions-list">
                  <li v-for="suggestion in validationResult.suggestions" :key="suggestion" class="suggestion-item">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button @click="$emit('close')" class="close-button" title="Закрити попередження">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { QueryValidationResult } from '@/types'

interface Props {
  show: boolean
  validationResult?: QueryValidationResult | null
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.validation-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(2px);
  background: var(--warning-overlay-bg);
}

.validation-warning {
  background: linear-gradient(135deg, var(--warning-bg-start) 0%, var(--warning-bg-end) 100%);
  border-bottom: 1px solid var(--warning-border);
  box-shadow: 
    0 4px 6px -1px var(--warning-shadow-light),
    0 2px 4px -1px var(--warning-shadow-medium),
    0 10px 15px -3px var(--warning-shadow-accent);
  border-radius: 0 0 12px 12px;
  margin: 0 auto;
  max-width: 900px;
  position: relative;
}

.warning-container {
  padding: 16px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.warning-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.warning-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--warning-icon-bg);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.warning-icon {
  color: var(--warning-icon-color);
  filter: drop-shadow(0 1px 2px var(--warning-icon-shadow));
}

.warning-content {
  flex: 1;
  min-width: 0;
}

.warning-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--warning-text-primary);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.suggestions {
  margin-top: 12px;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--warning-text-secondary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggestion-item {
  font-size: 13px;
  color: var(--warning-text-tertiary);
  line-height: 1.5;
  padding: 8px 12px;
  background: var(--warning-suggestion-bg);
  border-radius: 6px;
  border-left: 3px solid var(--warning-suggestion-border);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: var(--warning-suggestion-bg-hover);
  transform: translateX(2px);
}

.close-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--warning-button-bg);
  border: 1px solid var(--warning-button-border);
  color: var(--warning-button-text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  margin-top: 4px;
}

.close-button:hover {
  background: var(--warning-button-bg-hover);
  border-color: var(--warning-button-border-hover);
  transform: scale(1.05);
  box-shadow: 0 2px 4px var(--warning-shadow-light);
}

.close-button:active {
  transform: scale(0.98);
}

/* Animations */
.warning-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.warning-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.warning-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.warning-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .validation-warning {
    margin: 0;
    border-radius: 0;
  }

  .warning-container {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
  }

  .warning-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .warning-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    margin-top: 0;
  }

  .warning-title {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .suggestions-title {
    font-size: 13px;
  }

  .suggestion-item {
    font-size: 12px;
    padding: 6px 10px;
  }

  .close-button {
    position: absolute;
    top: 12px;
    right: 16px;
    width: 28px;
    height: 28px;
    margin-top: 0;
  }

  .close-button svg {
    width: 16px;
    height: 16px;
  }
}

/* Subtle pulsing animation for attention */
@keyframes gentle-pulse {
  0%, 100% {
    box-shadow: 
      0 4px 6px -1px var(--warning-shadow-light),
      0 2px 4px -1px var(--warning-shadow-medium),
      0 10px 15px -3px var(--warning-shadow-accent);
  }
  50% {
    box-shadow: 
      0 4px 6px -1px var(--warning-shadow-light),
      0 2px 4px -1px var(--warning-shadow-medium),
      0 10px 15px -3px var(--warning-shadow-accent-hover);
  }
}

.validation-warning {
  animation: gentle-pulse 3s ease-in-out infinite;
}
</style> 