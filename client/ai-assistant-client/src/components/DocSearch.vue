<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { DocumentResult, SearchResults } from '@/types'

// Reactive state
const searchQuery = ref<string>('')
const isSearching = ref<boolean>(false)

// GraphQL Query
const SEARCH_DOCS = gql`
  query searchDocuments($query: String!) {
    searchDocuments(query: $query) {
      items {
        id
        title
        content
        source
        type
        technology
        createdAt
      }
      total
    }
  }
`

// Apollo Query with dynamic variables
const { result, loading, error, refetch } = useQuery<{ searchDocuments: SearchResults }>(
  SEARCH_DOCS, 
  () => ({ query: searchQuery.value }),
  {
    enabled: computed(() => searchQuery.value.trim().length > 0),
    debounce: 300,
  }
)

// Computed properties
const searchResults = computed(() => result.value?.searchDocuments?.items || [])
const totalResults = computed(() => result.value?.searchDocuments?.total || 0)
const hasQuery = computed(() => searchQuery.value.trim().length > 0)
const hasResults = computed(() => searchResults.value.length > 0)
const showNoResults = computed(() => hasQuery.value && !loading.value && !hasResults.value)

// Methods
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
}

function getSourceDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  isSearching.value = newQuery.trim().length > 0 && loading.value
})

watch(loading, (isLoading) => {
  isSearching.value = isLoading && hasQuery.value
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
            Пошук документації
          </h2>
          <p class="search-subtitle">
            Знайдіть потрібну інформацію у базі знань
          </p>
        </div>

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
              placeholder="Введіть ключові слова для пошуку..."
              class="search-input input"
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
          
          <!-- Search Status -->
          <div v-if="hasQuery" class="search-status">
            <div v-if="loading" class="loading-status">
              <div class="loading-spinner">
                <div class="spinner-small"></div>
              </div>
              <span>Пошук...</span>
            </div>
            <div v-else-if="hasResults" class="results-status">
              <span class="results-count">{{ totalResults }}</span>
              <span class="results-text">
                {{ totalResults === 1 ? 'результат' : totalResults < 5 ? 'результати' : 'результатів' }}
              </span>
            </div>
            <div v-else-if="showNoResults" class="no-results-status">
              <span>Нічого не знайдено</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state card">
      <div class="card-body">
        <div class="error-content">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Помилка пошуку</h3>
          <p>{{ error.message }}</p>
          <button @click="() => refetch()" class="btn btn-primary btn-sm">
            Спробувати знову
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="hasQuery" class="search-results">
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
            <p class="search-tips">
              <strong>Поради для пошуку:</strong><br>
              • Спробуйте інші ключові слова<br>
              • Перевірте правопис<br>
              • Використовуйте більш загальні терміни
            </p>
          </div>
        </div>
      </div>

      <!-- Results List -->
      <div v-else-if="hasResults" class="results-list">
        <div
          v-for="doc in searchResults"
          :key="doc.id"
          class="doc-result-card card fade-in"
        >
          <div class="card-body">
            <div class="doc-header">
              <div class="doc-title-section">
                <div class="doc-technology">
                  <span class="tech-icon">{{ getTechnologyIcon(doc.technology) }}</span>
                  <span :class="['tech-badge', getTechnologyColor(doc.technology)]">
                    {{ doc.technology }}
                  </span>
                </div>
                <h3 class="doc-title">{{ doc.title }}</h3>
              </div>
              
              <div class="doc-meta">
                <span class="doc-type">{{ doc.type }}</span>
                <time class="doc-date">{{ formatDate(doc.createdAt) }}</time>
              </div>
            </div>

            <div class="doc-content">
              <p>{{ truncateContent(doc.content) }}</p>
            </div>

            <div class="doc-footer">
              <div class="doc-source">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13C10 15.21 11.79 17 14 17H18C20.21 17 22 15.21 22 13V7C22 4.79 20.21 3 18 3H14C11.79 3 10 4.79 10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14 11C14 8.79 12.21 7 10 7H6C3.79 7 2 8.79 2 11V17C2 19.21 3.79 21 6 21H10C12.21 21 14 19.21 14 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <a 
                  :href="doc.source" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="source-link"
                >
                  {{ getSourceDomain(doc.source) }}
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
      </div>
    </div>

    <!-- Welcome State -->
    <div v-else class="welcome-state card">
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
          <h3>Вітаємо в пошуку документації!</h3>
          <p>
            Використовуйте пошук вище, щоб знайти потрібну інформацію 
            з документації Vue.js, Node.js, TypeScript та GrapesJS.
          </p>
          
          <div class="search-examples">
            <h4>Приклади пошукових запитів:</h4>
            <div class="example-queries">
              <button 
                v-for="example in ['component', 'API', 'methods', 'props', 'lifecycle']"
                :key="example"
                @click="searchQuery = example"
                class="example-query btn btn-secondary btn-sm"
              >
                {{ example }}
              </button>
            </div>
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

.search-tips {
  background-color: var(--color-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  text-align: left;
  line-height: var(--line-height-relaxed);
}

/* Welcome State */
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

/* Responsive */
@media (max-width: 768px) {
  .doc-search {
    margin: 0;
  }

  .search-input {
    font-size: var(--font-size-base);
    height: 48px;
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
}
</style>
