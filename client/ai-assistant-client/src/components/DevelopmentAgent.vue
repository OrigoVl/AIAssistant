<template>
  <div class="development-agent">
    <!-- Navigation Tabs -->
    <div class="agent-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Code Generation Tab -->
      <div v-if="activeTab === 'code-generation'" class="tab-panel">
        <CodeGenerationPanel />
      </div>

      <!-- Code Review Tab -->
      <div v-if="activeTab === 'code-review'" class="tab-panel">
        <CodeReviewPanel />
      </div>

      <!-- Debugging Tab -->
      <div v-if="activeTab === 'debugging'" class="tab-panel">
        <DebuggingPanel />
      </div>

      <!-- Project Management Tab -->
      <div v-if="activeTab === 'project-management'" class="tab-panel">
        <ProjectManagementPanel />
      </div>

      <!-- Technology Recommendations Tab -->
      <div v-if="activeTab === 'recommendations'" class="tab-panel">
        <TechnologyRecommendationsPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CodeGenerationPanel from '@/components/development/CodeGenerationPanel.vue'
import CodeReviewPanel from '@/components/development/CodeReviewPanel.vue'
import DebuggingPanel from '@/components/development/DebuggingPanel.vue'
import ProjectManagementPanel from '@/components/development/ProjectManagementPanel.vue'
import TechnologyRecommendationsPanel from '@/components/development/TechnologyRecommendationsPanel.vue'

const activeTab = ref('code-generation')

const tabs = [
  { id: 'code-generation', label: 'Code Generation', icon: '⚡' },
  { id: 'code-review', label: 'Code Review', icon: '🔍' },
  { id: 'debugging', label: 'Debugging', icon: '🐛' },
  { id: 'project-management', label: 'Project Management', icon: '📋' },
  { id: 'recommendations', label: 'Tech Recommendations', icon: '💡' },
]
</script>

<style scoped>
.development-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-background);
}

.agent-tabs {
  display: flex;
  background: var(--gradient-surface);
  border-bottom: 2px solid var(--color-border);
  overflow-x: auto;
  padding: var(--space-2);
  gap: var(--space-2);
  box-shadow: 0 4px 12px var(--shadow-light);
  position: relative;
}

.agent-tabs::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease-in-out infinite;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.tab-button:hover {
  color: var(--color-text);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.tab-button:hover::before {
  left: 100%;
}

.tab-button.active {
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-color: var(--color-primary);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.tab-button.active::before {
  left: 100%;
}

.tab-icon {
  font-size: var(--font-size-xl);
  filter: drop-shadow(0 2px 4px var(--shadow-medium));
  transition: all 0.3s ease;
}

.tab-button:hover .tab-icon {
  transform: scale(1.1);
}

.tab-button.active .tab-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 4px 8px var(--shadow-heavy));
}

.tab-label {
  font-weight: var(--font-weight-semibold);
  text-shadow: 0 1px 2px var(--shadow-light);
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  padding: var(--space-4);
  overflow-y: auto;
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .agent-tabs {
    flex-wrap: wrap;
    padding: var(--space-1);
    gap: var(--space-1);
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
    justify-content: center;
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-xs);
  }

  .tab-icon {
    font-size: var(--font-size-lg);
  }

  .tab-panel {
    padding: var(--space-3);
  }
}
</style>
