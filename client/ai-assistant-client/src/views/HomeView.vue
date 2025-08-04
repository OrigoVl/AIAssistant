<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">AI Development Assistant</h1>
        <p class="hero-description">
          Your comprehensive AI-powered development companion for coding, debugging, and project
          management
        </p>

        <div class="agent-cards">
          <div class="agent-card" @click="navigateToAgent('ai-assistant')">
            <div class="agent-icon">🤖</div>
            <h3 class="agent-title">AI Assistant</h3>
            <p class="agent-description">
              Get intelligent answers to your development questions, code explanations, and
              technical guidance
            </p>
            <div class="agent-features">
              <span class="feature-tag">Code Analysis</span>
              <span class="feature-tag">Technical Q&A</span>
              <span class="feature-tag">Best Practices</span>
            </div>
            <AButton variant="primary" class="agent-button">Open AI Assistant</AButton>
          </div>

          <div class="agent-card" @click="navigateToAgent('development-agent')">
            <div class="agent-icon">⚡</div>
            <h3 class="agent-title">Development Agent</h3>
            <p class="agent-description">
              Generate code, review quality, debug issues, and manage your development projects
            </p>
            <div class="agent-features">
              <span class="feature-tag">Code Generation</span>
              <span class="feature-tag">Code Review</span>
              <span class="feature-tag">Project Management</span>
            </div>
            <AButton variant="primary" class="agent-button">Open Development Agent</AButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AButton from '@/components/ui/AButton.vue'

const router = useRouter()

function navigateToAgent(agentName: string): void {
  router.push({ name: agentName })
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

.home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.hero-section {
  width: 100%;
  max-width: 1200px;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: var(--space-4);
  text-shadow: 0 4px 8px var(--shadow-heavy);
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: var(--space-8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  text-shadow: 0 2px 4px var(--shadow-medium);
}

.agent-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.agent-card {
  background: var(--gradient-surface-reverse);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--color-border);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-medium);
  position: relative;
  overflow: hidden;
}

.agent-card::before {
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

.agent-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px var(--shadow-heavy);
  border-color: var(--color-primary-light);
}

.agent-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  display: block;
  filter: drop-shadow(0 4px 8px var(--shadow-medium));
  transition: all 0.3s ease;
}

.agent-card:hover .agent-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 6px 12px var(--shadow-heavy));
}

.agent-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-3);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.agent-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.agent-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-6);
}

.feature-tag {
  background: var(--gradient-primary-light);
  color: var(--color-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-primary-light);
  transition: all 0.3s ease;
}

.feature-tag:hover {
  background: var(--color-primary-light);
  box-shadow: 0 2px 8px var(--shadow-primary);
}

.agent-button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 12px var(--shadow-primary);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agent-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.agent-button:hover::before {
  left: 100%;
}

.agent-button:hover {
  background: linear-gradient(135deg, var(--color-primary-hover), var(--color-secondary-hover));
  box-shadow: 0 6px 20px var(--shadow-primary-hover);
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-description {
    font-size: var(--font-size-lg);
  }

  .agent-cards {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .agent-card {
    padding: var(--space-6);
  }

  .agent-icon {
    font-size: 3rem;
  }
}
</style>
