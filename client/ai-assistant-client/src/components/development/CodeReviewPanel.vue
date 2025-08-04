<template>
  <div class="code-review-panel">
    <div class="panel-header">
      <h2 class="panel-title">Code Review</h2>
      <p class="panel-description">Analyze your code for quality, issues, and best practices</p>
    </div>

    <div class="form-container">
      <!-- Code Input -->
      <ATextarea
        v-model="form.code"
        label="Code to Review *"
        id="code"
        placeholder="Paste your code here..."
        :rows="12"
      />

      <!-- Language Selection -->
      <ASelect
        v-model="form.language"
        label="Programming Language *"
        id="language"
        placeholder="Select language"
        :options="languageOptions"
      />

      <!-- Context and Focus Areas -->
      <div class="form-row">
        <ATextarea
          v-model="form.context"
          label="Context"
          id="context"
          placeholder="Provide context about what this code does..."
          :rows="3"
        />
        <ACheckboxGroup v-model="form.focusAreas" label="Focus Areas" :options="focusAreaOptions" />
      </div>

      <!-- Review Button -->
      <div class="form-actions">
        <AButton
          variant="primary"
          :loading="isReviewing"
          :disabled="!canReview"
          @click="reviewCode"
        >
          {{ isReviewing ? 'Reviewing...' : 'Review Code' }}
        </AButton>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="review-results">
      <!-- Score and Summary -->
      <div class="score-section">
        <div class="score-display">
          <div class="score-circle" :class="scoreClass">
            <span class="score-number">{{ result.score }}</span>
            <span class="score-label">Score</span>
          </div>
        </div>
        <div class="summary-section">
          <h3>Review Summary</h3>
          <p>{{ result.summary }}</p>
        </div>
      </div>

      <!-- Issues -->
      <div v-if="result.issues.length > 0" class="issues-section">
        <h3>Issues Found ({{ result.issues.length }})</h3>
        <div class="issues-list">
          <div v-for="(issue, index) in result.issues" :key="index" class="issue-item">
            <div class="issue-icon">⚠️</div>
            <div class="issue-content">
              <p>{{ issue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="result.suggestions.length > 0" class="suggestions-section">
        <h3>Suggestions ({{ result.suggestions.length }})</h3>
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in result.suggestions"
            :key="index"
            class="suggestion-item"
          >
            <div class="suggestion-icon">💡</div>
            <div class="suggestion-content">
              <p>{{ suggestion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Best Practices -->
      <div class="best-practices-section">
        <h3>Best Practices</h3>
        <div class="practices-list">
          <div v-for="(practice, index) in result.bestPractices" :key="index" class="practice-item">
            <div class="practice-icon">✅</div>
            <div class="practice-content">
              <p>{{ practice }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Metadata -->
      <div class="metadata-section">
        <p class="review-date">Reviewed on: {{ formatDate(result.reviewedAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ATextarea, ASelect, ACheckboxGroup, AButton } from '../ui'

const REVIEW_CODE = gql`
  mutation ReviewCode($input: CodeReviewInput!) {
    reviewCode(input: $input) {
      score
      issues
      suggestions
      bestPractices
      summary
      reviewedAt
    }
  }
`

const form = ref({
  code: '',
  language: '',
  context: '',
  focusAreas: [] as string[],
})

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

const focusAreaOptions = [
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'readability', label: 'Readability' },
  { value: 'maintainability', label: 'Maintainability' },
  { value: 'testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
]

const result = ref<any>(null)
const isReviewing = ref(false)

const { mutate: reviewCodeMutation } = useMutation(REVIEW_CODE)

const canReview = computed(() => {
  return form.value.code.trim() && form.value.language
})

const scoreClass = computed(() => {
  if (!result.value) return ''
  const score = result.value.score
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
})

async function reviewCode(): Promise<void> {
  if (!canReview.value) return

  isReviewing.value = true
  result.value = null

  try {
    const response = await reviewCodeMutation({
      input: {
        ...form.value,
        focusAreas: form.value.focusAreas.length > 0 ? form.value.focusAreas : undefined,
      },
    })

    if (response?.data?.reviewCode) {
      result.value = response.data.reviewCode
    }
  } catch (error) {
    console.error('Code review failed:', error)
    // Handle error - show notification
  } finally {
    isReviewing.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.code-review-panel {
  max-width: 900px;
  margin: 0 auto;
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

.review-results {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

.score-section {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.score-display {
  flex-shrink: 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
  transition: var(--transition);
}

.score-circle.excellent {
  background-color: #10b981;
  border-color: #059669;
  color: white;
}

.score-circle.good {
  background-color: #3b82f6;
  border-color: #2563eb;
  color: white;
}

.score-circle.fair {
  background-color: #f59e0b;
  border-color: #d97706;
  color: white;
}

.score-circle.poor {
  background-color: #ef4444;
  border-color: #dc2626;
  color: white;
}

.score-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.score-label {
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

.summary-section {
  flex: 1;
}

.summary-section h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.summary-section p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.issues-section,
.suggestions-section,
.best-practices-section {
  margin-bottom: var(--space-6);
}

.issues-section h3,
.suggestions-section h3,
.best-practices-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.issues-list,
.suggestions-list,
.practices-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.issue-item,
.suggestion-item,
.practice-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.issue-icon,
.suggestion-icon,
.practice-icon {
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.issue-content,
.suggestion-content,
.practice-content {
  flex: 1;
}

.issue-content p,
.suggestion-content p,
.practice-content p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.5;
}

.metadata-section {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.review-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .focus-areas {
    grid-template-columns: 1fr;
  }

  .score-section {
    flex-direction: column;
    text-align: center;
  }

  .review-form,
  .review-results {
    padding: var(--space-4);
  }
}
</style>
