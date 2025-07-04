<template>
  <div class="tech-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">Технології</h3>
    </div>
    <div class="tech-buttons">
      <button
        v-for="tech in technologies"
        :key="tech.value"
        :class="[
          'tech-button',
          { 'tech-button-active': selectedTech === tech.value }
        ]"
        @click="$emit('select-technology', tech.value)"
      >
        <span class="tech-icon">
          {{ getTechIcon(tech.value) }}
        </span>
        <span class="tech-label">{{ tech.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Technology } from '@/types'

interface Props {
  technologies: Technology[]
  selectedTech: string
}

interface Emits {
  (e: 'select-technology', technology: string): void
}

defineProps<Props>()
defineEmits<Emits>()

function getTechIcon(tech: string): string {
  const icons: Record<string, string> = {
    vue: '🟢',
    node: '🟩', 
    typescript: '🔷',
    grapesjs: '🎨'
  }
  return icons[tech] || '🔧'
}
</script>

<style scoped>
.tech-sidebar {
  width: 280px;
  padding: var(--space-4);
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface);
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: var(--space-4);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.tech-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tech-button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-align: left;
  width: 100%;
}

.tech-button:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

.tech-button-active {
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}

.tech-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.tech-label {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .tech-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-3);
  }
  
  .tech-buttons {
    flex-direction: row;
    gap: var(--space-1);
    overflow-x: auto;
    padding-bottom: var(--space-1);
  }
  
  .tech-button {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
    min-width: fit-content;
  }
  
  .tech-icon {
    font-size: var(--font-size-base);
  }
}
</style> 