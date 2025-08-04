<template>
  <div class="debugging-panel">
    <div class="panel-header">
      <h2 class="panel-title">Code Debugging</h2>
      <p class="panel-description">Analyze errors and get solutions to fix your code issues</p>
    </div>

    <div class="form-container">
      <!-- Error Message -->
      <ATextarea
        v-model="form.errorMessage"
        label="Error Message *"
        id="errorMessage"
        placeholder="Paste the error message here..."
        :rows="4"
      />

      <!-- Code Input -->
      <ATextarea
        v-model="form.code"
        label="Code with Error *"
        id="code"
        placeholder="Paste the code that's causing the error..."
        :rows="8"
      />

      <!-- Language and Environment -->
      <div class="form-row">
        <ASelect
          v-model="form.language"
          label="Programming Language *"
          id="language"
          placeholder="Select language"
          :options="languageOptions"
        />
        <AInput
          v-model="form.environment"
          label="Environment"
          id="environment"
          placeholder="e.g., Node.js 18, Python 3.9, Browser"
        />
      </div>

      <!-- Stack Trace -->
      <ATextarea
        v-model="form.stackTrace"
        label="Stack Trace (Optional)"
        id="stackTrace"
        placeholder="Paste the full stack trace if available..."
        :rows="6"
      />

      <!-- Debug Button -->
      <div class="form-actions">
        <AButton variant="primary" :loading="isDebugging" :disabled="!canDebug" @click="debugCode">
          {{ isDebugging ? 'Analyzing...' : 'Debug Code' }}
        </AButton>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="debugging-results">
      <!-- Root Cause -->
      <div class="root-cause-section">
        <h3>Root Cause Analysis</h3>
        <div class="root-cause-card">
          <div class="cause-icon">🔍</div>
          <div class="cause-content">
            <p>{{ result.rootCause }}</p>
          </div>
        </div>
      </div>

      <!-- Solutions -->
      <div class="solutions-section">
        <h3>Solutions ({{ result.solutions.length }})</h3>
        <div class="solutions-list">
          <div v-for="(solution, index) in result.solutions" :key="index" class="solution-item">
            <div class="solution-number">{{ index + 1 }}</div>
            <div class="solution-content">
              <p>{{ solution }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Code -->
      <div class="fixed-code-section">
        <div class="section-header">
          <h3>Suggested Fix</h3>
          <button type="button" class="btn btn-secondary" @click="copyFixedCode">
            Copy Fixed Code
          </button>
        </div>
        <pre class="code-block fixed-code"><code>{{ result.fixedCode }}</code></pre>
      </div>

      <!-- Prevention Tips -->
      <div class="prevention-section">
        <h3>Prevention Tips</h3>
        <div class="prevention-list">
          <div v-for="(tip, index) in result.preventionTips" :key="index" class="prevention-item">
            <div class="prevention-icon">🛡️</div>
            <div class="prevention-content">
              <p>{{ tip }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="explanation-section">
        <h3>Detailed Explanation</h3>
        <div class="explanation-content">
          <p>{{ result.explanation }}</p>
        </div>
      </div>

      <!-- Debug Metadata -->
      <div class="metadata-section">
        <p class="debug-date">Debugged on: {{ formatDate(result.debuggedAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ATextarea, ASelect, AButton } from '../ui'

const DEBUG_CODE = gql`
  mutation DebugCode($input: DebuggingInput!) {
    debugCode(input: $input) {
      rootCause
      solutions
      fixedCode
      preventionTips
      explanation
      debuggedAt
    }
  }
`

const form = ref({
  errorMessage: '',
  code: '',
  language: '',
  stackTrace: '',
  environment: '',
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

const result = ref<any>(null)
const isDebugging = ref(false)

const { mutate: debugCodeMutation } = useMutation(DEBUG_CODE)

const canDebug = computed(() => {
  return form.value.errorMessage.trim() && form.value.code.trim() && form.value.language
})

async function debugCode(): Promise<void> {
  if (!canDebug.value) return

  isDebugging.value = true
  result.value = null

  try {
    const response = await debugCodeMutation({
      input: {
        ...form.value,
        stackTrace: form.value.stackTrace || undefined,
        environment: form.value.environment || undefined,
      },
    })

    if (response?.data?.debugCode) {
      result.value = response.data.debugCode
    }
  } catch (error) {
    console.error('Debugging failed:', error)
    // Handle error - show notification
  } finally {
    isDebugging.value = false
  }
}

async function copyFixedCode(): Promise<void> {
  if (result.value?.fixedCode) {
    try {
      await navigator.clipboard.writeText(result.value.fixedCode)
      // Show success notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.debugging-panel {
  max-width: 900px;
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

.debugging-form {
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

.debugging-form::before {
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

.stack-trace-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  background-color: #1f2937;
  color: #f3f4f6;
  border-color: #374151;
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

.debugging-results {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

.root-cause-section,
.solutions-section,
.fixed-code-section,
.prevention-section,
.explanation-section {
  margin-bottom: var(--space-6);
}

.root-cause-section h3,
.solutions-section h3,
.fixed-code-section h3,
.prevention-section h3,
.explanation-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.root-cause-card {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-md);
}

.cause-icon {
  flex-shrink: 0;
  font-size: var(--font-size-xl);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cause-content {
  flex: 1;
}

.cause-content p {
  margin: 0;
  color: #92400e;
  line-height: 1.6;
  font-weight: var(--font-weight-medium);
}

.solutions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.solution-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.solution-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.solution-content {
  flex: 1;
}

.solution-content p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-header h3 {
  margin: 0;
}

.fixed-code {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-text);
  border-left: 4px solid #10b981;
}

.prevention-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.prevention-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: var(--radius-md);
}

.prevention-icon {
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prevention-content {
  flex: 1;
}

.prevention-content p {
  margin: 0;
  color: #166534;
  line-height: 1.5;
}

.explanation-content {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.explanation-content p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.6;
}

.metadata-section {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.debug-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .debugging-form,
  .debugging-results {
    padding: var(--space-4);
  }

  .section-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
}
</style>
