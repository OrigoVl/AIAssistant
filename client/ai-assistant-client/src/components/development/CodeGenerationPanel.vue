<template>
  <div class="code-generation-panel">
    <div class="panel-header">
      <h2 class="panel-title">Code Generation</h2>
      <p class="panel-description">Generate code based on your requirements and specifications</p>
    </div>

    <div class="form-container">
      <!-- Description Input -->
      <ATextarea
        v-model="form.description"
        label="Description *"
        id="description"
        placeholder="Describe what you want to build..."
        :rows="4"
      />

      <!-- Technology Selection -->
      <div class="form-group">
        <label class="form-label">Technologies *</label>
        <div class="technology-selector">
          <div class="selected-technologies">
            <div v-for="tech in form.technologies" :key="tech" class="tech-tag">
              <span>{{ getTechnologyDisplayName(tech) }}</span>
              <button type="button" class="remove-tech" @click="removeTechnology(tech)">×</button>
            </div>
          </div>
          <div class="tech-options">
            <div
              class="tech-option"
              v-for="tech in availableTechnologies"
              :key="tech.value"
              @click="toggleTechnology(tech.value)"
            >
              <input
                type="checkbox"
                :checked="form.technologies.includes(tech.value)"
                class="tech-checkbox"
              />
              <span>{{ tech.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Language and Framework -->
      <div class="form-row">
        <AInput
          v-model="form.language"
          label="Language"
          id="language"
          placeholder="e.g., TypeScript, Python"
        />
        <ASelect
          v-model="form.framework"
          label="Framework"
          id="framework"
          placeholder="Select framework"
          :options="frameworkOptions"
        />
      </div>

      <!-- Requirements -->
      <div class="form-group">
        <label class="form-label">Requirements</label>
        <div class="requirements-input">
          <div v-for="(req, index) in form.requirements" :key="index" class="requirement-tag">
            <span>{{ req }}</span>
            <button type="button" class="remove-tag" @click="removeRequirement(index)">×</button>
          </div>
          <div class="requirement-input">
            <AInput
              v-model="newRequirement"
              placeholder="Add requirement..."
              @keyup.enter="addRequirement"
            />
            <AButton variant="secondary" @click="addRequirement"> Add </AButton>
          </div>
        </div>
      </div>

      <!-- Style and Options -->
      <div class="form-row">
        <ASelect v-model="form.style" label="Code Style" id="style" :options="styleOptions" />
        <div class="form-group">
          <label class="form-label">Options</label>
          <div class="checkbox-group">
            <ACheckbox v-model="form.includeTests" label="Include Tests" />
            <ACheckbox v-model="form.includeDocs" label="Include Documentation" />
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="form-actions">
        <AButton
          variant="primary"
          :loading="isGenerating"
          :disabled="!canGenerate"
          @click="generateCode"
        >
          {{ isGenerating ? 'Generating...' : 'Generate Code' }}
        </AButton>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="generation-results">
      <div class="result-header">
        <h3>Generated Code</h3>
        <AButton variant="secondary" @click="copyToClipboard">Copy Code</AButton>
      </div>

      <!-- Code Display -->
      <div class="code-section">
        <h4>Main Code</h4>
        <pre class="code-block"><code>{{ result.code }}</code></pre>
      </div>

      <!-- Tests -->
      <div v-if="result.tests && result.tests.length > 0" class="code-section">
        <h4>Tests</h4>
        <pre
          v-for="(test, index) in result.tests"
          :key="index"
          class="code-block"
        ><code>{{ test }}</code></pre>
      </div>

      <!-- Documentation -->
      <div v-if="result.documentation && result.documentation.length > 0" class="code-section">
        <h4>Documentation</h4>
        <div v-for="(doc, index) in result.documentation" :key="index" class="doc-block">
          {{ doc }}
        </div>
      </div>

      <!-- Thinking Process -->
      <div v-if="result.thinking" class="thinking-section">
        <h4>AI Thinking Process</h4>
        <div class="thinking-block">
          <pre>{{ result.thinking }}</pre>
        </div>
      </div>

      <!-- Explanation -->
      <div class="explanation-section">
        <h4>Explanation</h4>
        <p>{{ result.explanation }}</p>
      </div>

      <!-- Suggestions -->
      <div class="suggestions-section">
        <h4>Suggestions</h4>
        <ul class="suggestions-list">
          <li v-for="suggestion in result.suggestions" :key="suggestion">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { AInput, ATextarea, ASelect, ACheckbox, AButton } from '../ui'

const GENERATE_CODE = gql`
  mutation GenerateCode($input: CodeGenerationInput!) {
    generateCode(input: $input) {
      code
      tests
      documentation
      explanation
      suggestions
      thinking
      generatedAt
    }
  }
`

const form = ref({
  description: '',
  technologies: [] as string[],
  language: '',
  framework: '',
  requirements: [] as string[],
  style: 'clean',
  includeTests: false,
  includeDocs: false,
})

const availableTechnologies = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
]

const frameworkOptions = [
  { value: 'express', label: 'Express.js' },
  { value: 'fastify', label: 'Fastify' },
  { value: 'nest', label: 'NestJS' },
  { value: 'django', label: 'Django' },
  { value: 'flask', label: 'Flask' },
  { value: 'spring', label: 'Spring Boot' },
  { value: 'laravel', label: 'Laravel' },
  { value: 'next', label: 'Next.js' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'gatsby', label: 'Gatsby' },
]

const styleOptions = [
  { value: 'clean', label: 'Clean & Readable' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'verbose', label: 'Verbose with Comments' },
  { value: 'functional', label: 'Functional' },
  { value: 'oop', label: 'Object-Oriented' },
]

const newRequirement = ref('')
const result = ref<any>(null)
const isGenerating = ref(false)

const { mutate: generateCodeMutation } = useMutation(GENERATE_CODE)

const canGenerate = computed(() => {
  return form.value.description.trim() && form.value.technologies.length > 0
})

function getTechnologyDisplayName(techValue: string): string {
  const tech = availableTechnologies.find((t) => t.value === techValue)
  return tech ? tech.label : techValue
}

function addTechnology(techValue: string): void {
  if (!form.value.technologies.includes(techValue)) {
    form.value.technologies.push(techValue)
  }
}

function removeTechnology(techValue: string): void {
  const index = form.value.technologies.indexOf(techValue)
  if (index > -1) {
    form.value.technologies.splice(index, 1)
  }
}

function toggleTechnology(techValue: string): void {
  if (form.value.technologies.includes(techValue)) {
    removeTechnology(techValue)
  } else {
    addTechnology(techValue)
  }
}

function addRequirement(): void {
  if (newRequirement.value.trim()) {
    form.value.requirements.push(newRequirement.value.trim())
    newRequirement.value = ''
  }
}

function removeRequirement(index: number): void {
  form.value.requirements.splice(index, 1)
}

async function generateCode(): Promise<void> {
  if (!canGenerate.value) return

  isGenerating.value = true
  result.value = null

  try {
    const response = await generateCodeMutation({
      input: {
        description: form.value.description,
        technology: form.value.technologies.join(', '), // Convert array to string for backend
        language: form.value.language,
        framework: form.value.framework,
        requirements: form.value.requirements.length > 0 ? form.value.requirements : undefined,
        style: form.value.style,
        includeTests: form.value.includeTests,
        includeDocs: form.value.includeDocs,
      },
    })

    if (response?.data?.generateCode) {
      result.value = response.data.generateCode
    }
  } catch (error) {
    console.error('Code generation failed:', error)
    // Handle error - show notification
  } finally {
    isGenerating.value = false
  }
}

async function copyToClipboard(): Promise<void> {
  if (result.value?.code) {
    try {
      await navigator.clipboard.writeText(result.value.code)
      // Show success notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
}
</script>

<style scoped>
.code-generation-panel {
  max-width: 800px;
  margin: 0 auto;
}

.requirements-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  min-height: 50px;
  padding: var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--gradient-surface);
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;
}

.requirements-input:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 12px var(--shadow-primary);
}

.requirements-input:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px var(--shadow-primary-focus),
    0 4px 12px var(--shadow-primary-hover);
}

.technology-selector {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  outline: none;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
  transition: all 0.3s ease;
}

.technology-selector:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.technology-selector:focus {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 12px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
}

.selected-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  min-height: 50px;
  background: var(--gradient-primary-light);
}

.tech-tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tech-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.tech-tag:hover::before {
  left: 100%;
}

.tech-tag:hover {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.remove-tech {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: bold;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.remove-tech:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.tech-options {
  max-height: 250px;
  overflow-x: hidden;
  background: var(--color-surface);
}

.tech-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.tech-option:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  transform: translateX(4px);
}

.tech-option:last-child {
  border-bottom: none;
}

.tech-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  transform: scale(1.1);
}

.requirement-tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--gradient-success);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 2px 8px var(--shadow-primary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.requirement-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.requirement-tag:hover::before {
  left: 100%;
}

.requirement-tag:hover {
  box-shadow: 0 4px 12px var(--shadow-primary-hover);
}

.remove-tag {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: bold;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.remove-tag:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.requirement-input {
  flex: 1;
  min-width: 200px;
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  outline: none;
}

.requirement-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-label:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  transform: translateX(4px);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.checkbox:checked {
  transform: scale(1.2);
}

.generation-results {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

.doc-block {
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .generation-form,
  .generation-results {
    padding: var(--space-4);
  }

  .result-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
}
</style>
