<template>
  <div class="technology-recommendations-panel">
    <div class="panel-header">
      <h2 class="panel-title">Technology Recommendations</h2>
      <p class="panel-description">Get personalized technology recommendations for your projects</p>
    </div>

    <!-- Recommendation Form -->
    <div class="form-container">
      <div class="form-section">
        <h3>Project Requirements</h3>

        <!-- Project Type -->
        <ASelect
          v-model="form.projectType"
          label="Project Type *"
          id="projectType"
          placeholder="Select project type"
          :options="projectTypeOptions"
        />

        <!-- Requirements -->
        <ACheckboxGroup
          v-model="form.requirements"
          label="Requirements"
          :options="requirementOptions"
        />

        <!-- Team Experience -->
        <ASelect
          v-model="form.teamExperience"
          label="Team Experience Level"
          id="teamExperience"
          placeholder="Select experience level"
          :options="teamExperienceOptions"
        />

        <!-- Project Timeline -->
        <ASelect
          v-model="form.projectTimeline"
          label="Project Timeline"
          id="projectTimeline"
          placeholder="Select timeline"
          :options="projectTimelineOptions"
        />

        <!-- Budget Considerations -->
        <ASelect
          v-model="form.budget"
          label="Budget Considerations"
          id="budget"
          placeholder="Select budget range"
          :options="budgetOptions"
        />

        <!-- Get Recommendations Button -->
        <div class="form-actions">
          <AButton
            variant="primary"
            :loading="isLoading"
            :disabled="!canGetRecommendations"
            @click="getRecommendations"
          >
            {{ isLoading ? 'Analyzing...' : 'Get Recommendations' }}
          </AButton>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="recommendations.length > 0" class="recommendations-results">
      <div class="results-header">
        <h3>Recommended Technologies</h3>
        <p class="results-subtitle">Based on your project requirements and constraints</p>
      </div>

      <div class="recommendations-grid">
        <div
          v-for="(tech, index) in recommendations"
          :key="index"
          class="tech-card"
          :class="getTechCategory(tech)"
        >
          <div class="tech-header">
            <div class="tech-rank">#{{ index + 1 }}</div>
            <h4 class="tech-name">{{ tech }}</h4>
            <div class="tech-category">{{ getTechCategory(tech) }}</div>
          </div>

          <div class="tech-details">
            <div class="tech-pros">
              <h5>Pros:</h5>
              <ul>
                <li v-for="pro in getTechPros(tech)" :key="pro">{{ pro }}</li>
              </ul>
            </div>

            <div class="tech-cons">
              <h5>Cons:</h5>
              <ul>
                <li v-for="con in getTechCons(tech)" :key="con">{{ con }}</li>
              </ul>
            </div>
          </div>

          <div class="tech-metrics">
            <div class="metric">
              <span class="metric-label">Learning Curve:</span>
              <div class="metric-bar">
                <div class="metric-fill" :style="{ width: getLearningCurve(tech) + '%' }"></div>
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">Performance:</span>
              <div class="metric-bar">
                <div class="metric-fill" :style="{ width: getPerformance(tech) + '%' }"></div>
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">Community:</span>
              <div class="metric-bar">
                <div class="metric-fill" :style="{ width: getCommunity(tech) + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="tech-actions">
            <button class="btn btn-secondary" @click="learnMore(tech)">Learn More</button>
            <button class="btn btn-primary" @click="selectTechnology(tech)">Select</button>
          </div>
        </div>
      </div>

      <!-- Alternative Recommendations -->
      <div class="alternatives-section">
        <h3>Alternative Considerations</h3>
        <div class="alternatives-grid">
          <div v-for="alt in alternativeTechnologies" :key="alt.name" class="alternative-card">
            <h4>{{ alt.name }}</h4>
            <p>{{ alt.description }}</p>
            <div class="alternative-use-case"><strong>Best for:</strong> {{ alt.useCase }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ASelect, ACheckboxGroup, AButton } from '../ui'

const GET_TECHNOLOGY_RECOMMENDATIONS = gql`
  query GetTechnologyRecommendations($projectType: String!, $requirements: [String!]!) {
    getTechnologyRecommendations(projectType: $projectType, requirements: $requirements)
  }
`

const form = ref({
  projectType: '',
  requirements: [] as string[],
  teamExperience: '',
  projectTimeline: '',
  budget: '',
})

const projectTypeOptions = [
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'api', label: 'API/Backend' },
  { value: 'desktop-app', label: 'Desktop Application' },
  { value: 'library', label: 'Library/Package' },
  { value: 'cli-tool', label: 'CLI Tool' },
  { value: 'game', label: 'Game' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai-ml', label: 'AI/ML Project' },
  { value: 'blockchain', label: 'Blockchain' },
]

const requirementOptions = [
  { value: 'scalability', label: 'Scalability' },
  { value: 'performance', label: 'High Performance' },
  { value: 'security', label: 'Security' },
  { value: 'real-time', label: 'Real-time Processing' },
  { value: 'mobile', label: 'Mobile Support' },
  { value: 'cross-platform', label: 'Cross-platform' },
  { value: 'cloud-native', label: 'Cloud Native' },
  { value: 'microservices', label: 'Microservices' },
  { value: 'ai-integration', label: 'AI Integration' },
  { value: 'data-visualization', label: 'Data Visualization' },
]

const teamExperienceOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

const projectTimelineOptions = [
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '1-2-months', label: '1-2 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-12-months', label: '6-12 months' },
  { value: '1-year-plus', label: '1+ years' },
]

const budgetOptions = [
  { value: 'free', label: 'Free/Open Source' },
  { value: 'low', label: 'Low Cost' },
  { value: 'medium', label: 'Medium Budget' },
  { value: 'high', label: 'High Budget' },
  { value: 'enterprise', label: 'Enterprise' },
]

const recommendations = ref<string[]>([])
const isLoading = ref(false)

const { load: loadRecommendations } = useLazyQuery(GET_TECHNOLOGY_RECOMMENDATIONS)

const canGetRecommendations = computed(() => {
  return form.value.projectType && form.value.requirements.length > 0
})

const alternativeTechnologies = ref([
  {
    name: 'Rust',
    description: 'Systems programming language with memory safety and performance',
    useCase: 'Performance-critical applications, system tools',
  },
  {
    name: 'Go',
    description: 'Simple, fast, and reliable language for building software',
    useCase: 'Microservices, cloud applications, CLI tools',
  },
  {
    name: 'Kotlin',
    description: 'Modern language that runs on the JVM',
    useCase: 'Android development, backend services',
  },
])

async function getRecommendations(): Promise<void> {
  if (!canGetRecommendations.value) return

  isLoading.value = true
  recommendations.value = []

  try {
    const result = await loadRecommendations(undefined, {
      projectType: form.value.projectType,
      requirements: form.value.requirements,
    })

    if (result?.data?.getTechnologyRecommendations) {
      recommendations.value = result.data.getTechnologyRecommendations
    }
  } catch (error) {
    console.error('Failed to get recommendations:', error)
    // Fallback recommendations
    recommendations.value = getFallbackRecommendations()
  } finally {
    isLoading.value = false
  }
}

function getFallbackRecommendations(): string[] {
  const fallbackMap: { [key: string]: string[] } = {
    web: ['Vue.js', 'React', 'Angular', 'Node.js', 'TypeScript'],
    mobile: ['React Native', 'Flutter', 'Ionic', 'NativeScript'],
    desktop: ['Electron', 'Tauri', 'Flutter Desktop'],
    api: ['Node.js', 'Express', 'Fastify', 'NestJS', 'GraphQL'],
    database: ['PostgreSQL', 'MongoDB', 'Redis', 'SQLite'],
    testing: ['Jest', 'Vitest', 'Cypress', 'Playwright'],
  }

  return fallbackMap[form.value.projectType] || ['Node.js', 'TypeScript', 'Vue.js']
}

function getTechCategory(tech: string): string {
  const categories: { [key: string]: string } = {
    'Vue.js': 'frontend',
    React: 'frontend',
    Angular: 'frontend',
    'Node.js': 'backend',
    Express: 'backend',
    TypeScript: 'language',
    Python: 'language',
    PostgreSQL: 'database',
    MongoDB: 'database',
  }
  return categories[tech] || 'other'
}

function getTechPros(tech: string): string[] {
  const pros: { [key: string]: string[] } = {
    'Vue.js': ['Easy to learn', 'Great documentation', 'Progressive framework'],
    React: ['Large ecosystem', 'Strong community', 'Flexible'],
    'Node.js': ['JavaScript everywhere', 'Fast development', 'Rich ecosystem'],
    TypeScript: ['Type safety', 'Better IDE support', 'Catch errors early'],
  }
  return pros[tech] || ['Popular choice', 'Good documentation', 'Active community']
}

function getTechCons(tech: string): string[] {
  const cons: { [key: string]: string[] } = {
    'Vue.js': ['Smaller ecosystem', 'Fewer enterprise adopters'],
    React: ['Steep learning curve', 'Complex state management'],
    'Node.js': ['Single-threaded', 'Callback hell (without proper patterns)'],
    TypeScript: ['Additional compilation step', 'Learning curve'],
  }
  return cons[tech] || ['May have limitations', 'Requires learning']
}

function getLearningCurve(tech: string): number {
  const curves: { [key: string]: number } = {
    'Vue.js': 85,
    React: 70,
    'Node.js': 80,
    TypeScript: 65,
  }
  return curves[tech] || 75
}

function getPerformance(tech: string): number {
  const performance: { [key: string]: number } = {
    'Vue.js': 90,
    React: 85,
    'Node.js': 80,
    TypeScript: 95,
  }
  return performance[tech] || 80
}

function getCommunity(tech: string): number {
  const community: { [key: string]: number } = {
    'Vue.js': 80,
    React: 95,
    'Node.js': 90,
    TypeScript: 85,
  }
  return community[tech] || 80
}

function learnMore(tech: string): void {
  // Implementation for learning more about a technology
  console.log('Learn more about:', tech)
  // Could open documentation, tutorials, etc.
}

function selectTechnology(tech: string): void {
  // Implementation for selecting a technology
  console.log('Selected technology:', tech)
  // Could save selection, show next steps, etc.
}
</script>

<style scoped>
.technology-recommendations-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.panel-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.recommendation-form {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  margin-bottom: var(--space-6);
  border: 2px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.recommendation-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease-in-out infinite;
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

.form-section h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.form-actions {
  margin-top: var(--space-6);
  text-align: center;
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
  to {
    transform: rotate(360deg);
  }
}

.recommendations-results {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

.results-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.results-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.results-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.tech-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition);
}

.tech-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tech-card.frontend {
  border-left: 4px solid #3b82f6;
}

.tech-card.backend {
  border-left: 4px solid #10b981;
}

.tech-card.language {
  border-left: 4px solid #f59e0b;
}

.tech-card.database {
  border-left: 4px solid #8b5cf6;
}

.tech-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.tech-rank {
  background-color: var(--color-primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.tech-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.tech-category {
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.tech-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.tech-pros h5,
.tech-cons h5 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.tech-pros h5 {
  color: #10b981;
}

.tech-cons h5 {
  color: #ef4444;
}

.tech-pros ul,
.tech-cons ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-pros li,
.tech-cons li {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--space-1) 0;
  line-height: 1.4;
}

.tech-pros li::before {
  content: '✓';
  color: #10b981;
  font-weight: bold;
  margin-right: var(--space-1);
}

.tech-cons li::before {
  content: '✗';
  color: #ef4444;
  font-weight: bold;
  margin-right: var(--space-1);
}

.tech-metrics {
  margin-bottom: var(--space-4);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  min-width: 100px;
}

.metric-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.tech-actions {
  display: flex;
  gap: var(--space-2);
}

.alternatives-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.alternatives-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.alternatives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.alternative-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.alternative-card h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.alternative-card p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
  line-height: 1.5;
}

.alternative-use-case {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .requirements-grid {
    grid-template-columns: 1fr;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .tech-details {
    grid-template-columns: 1fr;
  }

  .tech-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .recommendation-form,
  .recommendations-results {
    padding: var(--space-4);
  }
}
</style>
