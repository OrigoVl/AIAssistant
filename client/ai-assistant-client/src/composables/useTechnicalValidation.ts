import { ref } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { QueryValidationResult } from '@/types'

const VALIDATE_QUERY = gql`
  query ValidateQuery($query: String!) {
    validateQuery(query: $query) {
      isTechnical
      warning
      suggestions
    }
  }
`

export function useTechnicalValidation() {
  const lastValidationResult = ref<QueryValidationResult | null>(null)
  const showValidationWarning = ref<boolean>(false)
  const validationTimeout = ref<number | null>(null)

  const { load: validateQuery, loading: validationLoading } = useLazyQuery(VALIDATE_QUERY, undefined, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  })

  async function performValidation(queryText: string): Promise<void> {
    if (queryText.length < 2) {
      lastValidationResult.value = null
      showValidationWarning.value = false
      return
    }

    try {
      const result = await validateQuery(undefined, { query: queryText })
      if (result?.data?.validateQuery) {
        lastValidationResult.value = result.data.validateQuery
        
        // Показуємо попередження для нетехнічних запитів
        if (!result.data.validateQuery.isTechnical) {
          showValidationWarning.value = true
        } else {
          showValidationWarning.value = false
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
      lastValidationResult.value = null
    }
  }

  function handleInputChange(queryText: string): void {
    // Дебаунсинг валідації
    if (validationTimeout.value) {
      clearTimeout(validationTimeout.value)
    }
    
    validationTimeout.value = setTimeout(() => {
      if (queryText.trim()) {
        performValidation(queryText.trim())
      } else {
        lastValidationResult.value = null
        showValidationWarning.value = false
      }
    }, 500) as unknown as number
  }

  function hideValidationWarning(): void {
    showValidationWarning.value = false
  }

  function updateValidationFromResponse(response: any): void {
    if (response?.warning && !response?.isTechnical) {
      lastValidationResult.value = {
        isTechnical: response.isTechnical,
        warning: response.warning,
        suggestions: response.suggestions
      }
      showValidationWarning.value = true
    } else {
      // Скриваємо попередження для технічних запитів
      lastValidationResult.value = null
      showValidationWarning.value = false
    }
  }

  function isQueryBlocked(hasImage: boolean): boolean {
    return Boolean(lastValidationResult.value?.warning && 
           !lastValidationResult.value?.isTechnical &&
           !hasImage) // Зображення завжди дозволені
  }

  return {
    lastValidationResult,
    showValidationWarning,
    validationLoading,
    handleInputChange,
    hideValidationWarning,
    updateValidationFromResponse,
    isQueryBlocked
  }
} 