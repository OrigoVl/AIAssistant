<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { 
  CodeSearchResult, 
  CodeTechnologyInfo, 
  QueryValidationResult, 
  CodeSearchType
} from '@/types'
import { CODE_SEARCH_TYPES } from '@/types'

// Reactive state
const searchQuery = ref<string>('')
const selectedTechnology = ref<string>('')
const searchType = ref<CodeSearchType>('general')
const isSearching = ref<boolean>(false)
const lastValidationResult = ref<QueryValidationResult | null>(null)
const lastSearchResult = ref<CodeSearchResult | null>(null)

// GraphQL Queries
const GET_TECHNOLOGIES = gql`
  query GetCodeTechnologies {
    getCodeTechnologies {
      value
      label
      description
    }
  }
`

const VALIDATE_QUERY = gql`
  query ValidateQuery($query: String!) {
    validateQuery(query: $query) {
      isTechnical
      warning
      suggestions
    }
  }
`

const SEARCH_CODE = gql`
  query SearchCode($query: String!, $technologies: [String!], $limit: Int, $skipTechnicalValidation: Boolean) {
    searchCode(query: $query, technologies: $technologies, limit: $limit, skipTechnicalValidation: $skipTechnicalValidation) {
      results {
        document {
          id
          title
          content
          source
          type
          technology
          createdAt
        }
        score
        matchType
        matchDetails
      }
      totalFound
      executionTimeMs
      technologiesSearched
      strategiesUsed
      recommendations
      warning
      isTechnical
      suggestions
    }
  }
`

const SEARCH_CODE_DOCUMENTATION = gql`
  query SearchCodeDocumentation($query: String!, $technologies: [String!], $limit: Int) {
    searchCodeDocumentation(query: $query, technologies: $technologies, limit: $limit) {
      results {
        document {
          id
          title
          content
          source
          type
          technology
          createdAt
        }
        score
        matchType
      }
      totalFound
      recommendations
      warning
      isTechnical
      suggestions
    }
  }
`

const SEARCH_CODE_ISSUES = gql`
  query SearchCodeIssues($query: String!, $technologies: [String!], $limit: Int) {
    searchCodeIssues(query: $query, technologies: $technologies, limit: $limit) {
      results {
        document {
          id
          title
          content
          source
          type
          technology
          createdAt
        }
        score
        matchType
      }
      totalFound
      warning
      isTechnical
      suggestions
    }
  }
`

const SEARCH_API = gql`
  query SearchAPI($query: String!, $technologies: [String!], $limit: Int) {
    searchAPI(query: $query, technologies: $technologies, limit: $limit) {
      results {
        document {
          id
          title
          content
          source
          type
          technology
          createdAt
        }
        score
      }
      totalFound
      recommendations
      warning
      isTechnical
      suggestions
    }
  }
`

const SEARCH_TROUBLESHOOTING = gql`
  query SearchTroubleshooting($query: String!, $technologies: [String!], $limit: Int) {
    searchTroubleshooting(query: $query, technologies: $technologies, limit: $limit) {
      results {
        document {
          id
          title
          content
          source
          type
          technology
          createdAt
        }
        score
        matchType
      }
      totalFound
      strategiesUsed
      warning
      isTechnical
      suggestions
    }
  }
`

// Fetch available technologies
const { result: techResult } = useQuery<{ getCodeTechnologies: CodeTechnologyInfo[] }>(GET_TECHNOLOGIES)
const technologies = computed(() => techResult.value?.getCodeTechnologies || [])

// Lazy query for search
const { load: loadSearch, result: searchResult, loading } = useLazyQuery<{ 
  searchCode?: CodeSearchResult
  searchCodeDocumentation?: CodeSearchResult
  searchCodeIssues?: CodeSearchResult
  searchAPI?: CodeSearchResult
  searchTroubleshooting?: CodeSearchResult
}>(SEARCH_CODE)

// Computed properties
const searchResults = computed(() => {
  const result = searchResult.value?.searchCode || 
                 searchResult.value?.searchCodeDocumentation || 
                 searchResult.value?.searchCodeIssues || 
                 searchResult.value?.searchAPI || 
                 searchResult.value?.searchTroubleshooting
  
  lastSearchResult.value = result || null
  return result?.results || []
})

const totalResults = computed(() => lastSearchResult.value?.totalFound || 0)
const hasQuery = computed(() => searchQuery.value.trim().length > 0)
const hasResults = computed(() => searchResults.value.length > 0)
const showNoResults = computed(() => hasQuery.value && !loading.value && !hasResults.value)
const showWarning = computed(() => lastSearchResult.value?.warning || lastValidationResult.value?.warning)
const isTechnical = computed(() => lastSearchResult.value?.isTechnical ?? lastValidationResult.value?.isTechnical ?? true)
const suggestions = computed(() => lastSearchResult.value?.suggestions || lastValidationResult.value?.suggestions || [])

// Methods
async function performSearch() {
  if (searchQuery.value.length < 2) {
    lastSearchResult.value = null
    lastValidationResult.value = null
    return
  }

  isSearching.value = true
  
  try {
    const techList = selectedTechnology.value ? [selectedTechnology.value] : undefined
    
    // Choose appropriate query based on search type
    let query = SEARCH_CODE
    let variables: any = {
      query: searchQuery.value,
      technologies: techList,
      limit: 20
    }

    switch (searchType.value) {
      case CODE_SEARCH_TYPES.DOCUMENTATION:
        query = SEARCH_CODE_DOCUMENTATION
        break
      case CODE_SEARCH_TYPES.ISSUES:
        query = SEARCH_CODE_ISSUES
        break
      case CODE_SEARCH_TYPES.API:
        query = SEARCH_API
        break
      case CODE_SEARCH_TYPES.TROUBLESHOOTING:
        query = SEARCH_TROUBLESHOOTING
        break
      default:
        // General search - включаємо skipTechnicalValidation якщо потрібно
        variables.skipTechnicalValidation = false
        break
    }

    await loadSearch(query, variables)
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
  }
}

// Validate query before search (optional)
const { load: loadValidation, result: validationResult } = useLazyQuery<{ validateQuery: QueryValidationResult }>(VALIDATE_QUERY)

async function validateQuery() {
  if (searchQuery.value.length < 2) {
    lastValidationResult.value = null
    return
  }

  try {
    await loadValidation(VALIDATE_QUERY, { query: searchQuery.value })
    lastValidationResult.value = validationResult.value?.validateQuery || null
  } catch (error) {
    console.error('Validation error:', error)
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function truncateContent(content: string, maxLength: number = 300): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

function getTechnologyIcon(technology: string): string {
  const icons: Record<string, string> = {
    vue: '🌟',
    node: '🚀',
    typescript: '📘',
    grapesjs: '🎨',
  }
  return icons[technology] || '📄'
}

function getTechnologyColor(technology: string): string {
  const colors: Record<string, string> = {
    vue: 'tech-vue',
    node: 'tech-node',
    typescript: 'tech-typescript',
    grapesjs: 'tech-grapesjs',
  }
  return colors[technology] || 'tech-default'
}

function clearSearch(): void {
  searchQuery.value = ''
  lastSearchResult.value = null
  lastValidationResult.value = null
}

function getSourceDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function setExampleQuery(query: string): void {
  searchQuery.value = query
  performSearch()
}

// Watch for search query changes
let searchTimeout: number | null = null

watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    if (newQuery.trim().length > 1) {
      performSearch()
    } else {
      lastSearchResult.value = null
      lastValidationResult.value = null
    }
  }, 300)
})

// Watch for technology and search type changes
watch([selectedTechnology, searchType], () => {
  if (hasQuery.value) {
    performSearch()
  }
})
</script>

<template>
  <div class="doc-search">
    <!-- Search Header -->
    <div class="search-header card">
      <div class="card-body">
        <div class="search-title-section">
          <h2 class="search-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="search-icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Пошук по коду
          </h2>
          <p class="search-subtitle">
            Знайдіть потрібну інформацію з документації Vue.js, Node.js, TypeScript та GrapesJS
          </p>
        </div>

        <!-- Search Controls -->
        <div class="search-controls">
          <!-- Search Input -->
          <div class="search-input-container">
            <div class="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="input-search-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Введіть технічний запит для пошуку..."
                class="search-input input"
                :class="{ 'input-error': showWarning && !isTechnical }"
                :disabled="loading"
              />
              <button
                v-if="hasQuery"
                @click="clearSearch"
                class="clear-search-btn"
                title="Очистити пошук"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Controls -->
          <div class="filter-controls">
            <select v-model="selectedTechnology" class="filter-select">
              <option value="">Всі технології</option>
              <option 
                v-for="tech in technologies" 
                :key="tech.value" 
                :value="tech.value"
              >
                {{ tech.label }}
              </option>
            </select>
            
            <select v-model="searchType" class="filter-select">
              <option value="general">Загальний пошук</option>
              <option value="documentation">Тільки документація</option>
              <option value="issues">Тільки проблеми</option>
              <option value="api">API пошук</option>
              <option value="troubleshooting">Troubleshooting</option>
            </select>
          </div>
        </div>

        <!-- Search Status -->
        <div v-if="hasQuery" class="search-status">
          <div v-if="loading" class="loading-status">
            <div class="loading-spinner">
              <div class="spinner-small"></div>
            </div>
            <span>Пошук...</span>
          </div>
          <div v-else-if="hasResults && isTechnical" class="results-status">
            <span class="results-count">{{ totalResults }}</span>
            <span class="results-text">
              {{ totalResults === 1 ? 'результат' : totalResults < 5 ? 'результати' : 'результатів' }}
            </span>
            <span v-if="lastSearchResult?.executionTimeMs" class="execution-time">
              ({{ lastSearchResult.executionTimeMs }}ms)
            </span>
          </div>
          <div v-else-if="showNoResults" class="no-results-status">
            <span>Нічого не знайдено</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning for Non-Technical Queries -->
    <div v-if="showWarning && !isTechnical" class="warning-message card">
      <div class="card-body">
        <div class="warning-content">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            <h4>{{ showWarning }}</h4>
            <div v-if="suggestions.length > 0" class="suggestions">
              <h5>💡 Поради:</h5>
              <ul>
                <li v-for="suggestion in suggestions" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="hasQuery && isTechnical" class="search-results">
      <!-- Empty State -->
      <div v-if="showNoResults" class="empty-results card">
        <div class="card-body">
          <div class="empty-content">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Нічого не знайдено</h3>
            <p>
              Не вдалося знайти документи за запитом 
              <strong>"{{ searchQuery }}"</strong>
            </p>
            <div v-if="lastSearchResult?.recommendations" class="recommendations">
              <h5>💡 Рекомендації:</h5>
              <p>{{ lastSearchResult.recommendations }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Results List -->
      <div v-else-if="hasResults" class="results-list">
        <div class="results-header">
          <div class="search-info">
            <span>Знайдено в технологіях: 
              <strong>{{ lastSearchResult?.technologiesSearched?.join(', ') || 'всі' }}</strong>
            </span>
            <span>Стратегії: 
              <strong>{{ lastSearchResult?.strategiesUsed?.join(', ') || 'автоматичні' }}</strong>
            </span>
          </div>
        </div>

        <div
          v-for="doc in searchResults"
          :key="doc.document.id"
          class="doc-result-card card fade-in"
        >
          <div class="card-body">
            <div class="doc-header">
              <div class="doc-title-section">
                <div class="doc-technology">
                  <span class="tech-icon">{{ getTechnologyIcon(doc.document.technology) }}</span>
                  <span :class="['tech-badge', getTechnologyColor(doc.document.technology)]">
                    {{ doc.document.technology }}
                  </span>
                </div>
                <h3 class="doc-title">{{ doc.document.title }}</h3>
              </div>
              
              <div class="doc-meta">
                <span class="match-info">
                  <span class="match-type">{{ doc.matchType }}</span>
                  <span class="score">{{ doc.score.toFixed(2) }}</span>
                </span>
                <span class="doc-type">{{ doc.document.type }}</span>
                <time class="doc-date">{{ formatDate(doc.document.createdAt) }}</time>
              </div>
            </div>

            <div class="doc-content">
              <p>{{ truncateContent(doc.document.content) }}</p>
            </div>

            <div class="doc-footer">
              <div class="doc-source">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13C10 15.21 11.79 17 14 17H18C20.21 17 22 15.21 22 13V7C22 4.79 20.21 3 18 3H14C11.79 3 10 4.79 10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14 11C14 8.79 12.21 7 10 7H6C3.79 7 2 8.79 2 11V17C2 19.21 3.79 21 6 21H10C12.21 21 14 19.21 14 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <a 
                  :href="doc.document.source" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="source-link"
                >
                  {{ getSourceDomain(doc.document.source) }}
                </a>
              </div>

              <button class="view-details-btn btn btn-secondary btn-sm">
                Детальніше
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Search Recommendations -->
        <div v-if="lastSearchResult?.recommendations" class="search-recommendations card">
          <div class="card-body">
            <h4>💡 Рекомендації для покращення пошуку:</h4>
            <p>{{ lastSearchResult.recommendations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome State -->
    <div v-else-if="!hasQuery" class="welcome-state card">
      <div class="card-body">
        <div class="welcome-content">
          <div class="welcome-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Технічний пошук по коду!</h3>
          <p>
            Використовуйте пошук для знаходження інформації з документації 
            Vue.js, Node.js, TypeScript та GrapesJS. Система автоматично 
            відфільтровує нетехнічні запити.
          </p>
          
          <div class="search-examples">
            <h4>Приклади технічних запитів:</h4>
            <div class="example-queries">
              <button 
                v-for="example in [
                  'vue component lifecycle',
                  'async await в node.js',
                  'typescript interface',
                  'grapesjs блоки',
                  'error handling',
                  'API методи'
                ]"
                :key="example"
                @click="setExampleQuery(example)"
                class="example-query btn btn-secondary btn-sm"
              >
                {{ example }}
              </button>
            </div>
          </div>

          <div class="non-technical-warning">
            <h4>⚠️ Нетехнічні запити будуть відхилені:</h4>
            <p>
              Запити про їжу, погоду, розваги та інші нетехнічні теми 
              не будуть оброблені. Сервіс працює виключно з технічними питаннями.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-search {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Search Header */
.search-header {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border: 1px solid var(--primary-200);
}

.search-title-section {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.search-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-sm) 0;
}

.search-icon {
  color: var(--color-primary);
}

.search-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
}

/* Search Input */
.search-input-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-search-icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-muted);
  z-index: 2;
}

.search-input {
  padding-left: 48px;
  padding-right: 48px;
  font-size: var(--font-size-lg);
  height: 56px;
}

.input-error {
  border-color: var(--error-500) !important;
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25);
}

.clear-search-btn {
  position: absolute;
  right: var(--space-md);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  z-index: 2;
}

.clear-search-btn:hover {
  color: var(--color-text);
  background-color: var(--color-surface-variant);
}

/* Filter Controls */
.filter-controls {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-select:hover {
  border-color: var(--color-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.search-status {
  margin-top: var(--space-md);
  text-align: center;
  font-size: var(--font-size-sm);
}

.loading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
}

.loading-spinner {
  display: flex;
  align-items: center;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.results-status {
  color: var(--color-text-secondary);
}

.results-count {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.no-results-status {
  color: var(--color-text-muted);
}

.execution-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-left: var(--space-sm);
}

/* Error State */
.error-state {
  border-color: var(--error-500);
}

.error-content {
  text-align: center;
  color: var(--error-600);
}

.error-icon {
  margin-bottom: var(--space-md);
  color: var(--error-500);
}

.error-content h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-sm);
}

.error-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

/* Results */
.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.search-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.doc-result-card {
  transition: all var(--transition-fast);
}

.doc-result-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.doc-title-section {
  flex: 1;
}

.doc-technology {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.tech-icon {
  font-size: var(--font-size-lg);
}

.tech-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.tech-vue { background-color: var(--success-50); color: var(--success-600); }
.tech-node { background-color: var(--success-50); color: var(--success-600); }
.tech-typescript { background-color: var(--primary-50); color: var(--primary-600); }
.tech-grapesjs { background-color: var(--warning-50); color: var(--warning-600); }
.tech-default { background-color: var(--secondary-100); color: var(--secondary-600); }

.doc-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  line-height: var(--line-height-tight);
}

.doc-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
  text-align: right;
}

.match-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.match-type {
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.score {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.doc-type {
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.doc-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.doc-content {
  margin-bottom: var(--space-lg);
}

.doc-content p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.doc-source {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.source-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.source-link:hover {
  text-decoration: underline;
}

.view-details-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

/* Empty Results */
.empty-results {
  border-color: var(--warning-300);
  background-color: var(--warning-50);
}

.empty-content {
  text-align: center;
}

.empty-icon {
  margin-bottom: var(--space-lg);
  color: var(--color-text-muted);
}

.empty-content h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

.empty-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.recommendations {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.recommendations h5 {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.recommendations p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* Warning Message */
.warning-message {
  border-color: var(--warning-500);
  background-color: var(--warning-50);
}

.warning-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--warning-600);
}

.warning-icon {
  font-size: var(--font-size-2xl);
}

.warning-text h4 {
  margin-bottom: var(--space-sm);
  color: var(--warning-600);
}

.suggestions {
  margin-top: var(--space-sm);
  padding-left: var(--space-md);
  border-left: 2px solid var(--warning-300);
}

.suggestions h5 {
  font-size: var(--font-size-sm);
  color: var(--warning-600);
  margin-bottom: var(--space-sm);
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  font-size: var(--font-size-sm);
  color: var(--warning-600);
  margin-bottom: var(--space-xs);
}

.suggestions li:last-child {
  margin-bottom: 0;
}

/* Welcome State */
.welcome-state {
  border-color: var(--secondary-200);
  background-color: var(--secondary-50);
}

.welcome-content {
  text-align: center;
}

.welcome-icon {
  margin-bottom: var(--space-lg);
  color: var(--color-primary);
}

.welcome-content h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

.welcome-content p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-xl);
  line-height: var(--line-height-relaxed);
}

.search-examples {
  max-width: 400px;
  margin: 0 auto;
}

.search-examples h4 {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.example-queries {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
}

.example-query {
  font-size: var(--font-size-xs);
}

.non-technical-warning {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.non-technical-warning h4 {
  font-size: var(--font-size-sm);
  color: var(--warning-600);
  margin-bottom: var(--space-sm);
}

.non-technical-warning p {
  color: var(--warning-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* Search Recommendations */
.search-recommendations {
  margin-top: var(--space-md);
  border-color: var(--primary-200);
  background-color: var(--primary-50);
}

.search-recommendations h4 {
  font-size: var(--font-size-sm);
  color: var(--primary-600);
  margin-bottom: var(--space-sm);
}

.search-recommendations p {
  color: var(--primary-600);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .doc-search {
    margin: 0;
  }

  .search-controls {
    gap: var(--space-sm);
  }

  .search-input {
    font-size: var(--font-size-base);
    height: 48px;
  }

  .filter-controls {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .filter-select {
    width: 100%;
  }

  .doc-header {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .doc-meta {
    align-items: flex-start;
    flex-direction: row;
    gap: var(--space-md);
  }

  .doc-footer {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }

  .example-queries {
    justify-content: flex-start;
  }

  .warning-content {
    flex-direction: column;
    text-align: center;
  }

  .search-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>
