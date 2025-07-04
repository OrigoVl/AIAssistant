import { ref, computed } from 'vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { ChatMessage, AIResponse, ImageAnalysisResponse, ImageUploadResponse } from '@/types'

const ASK_AI = gql`
  query AskAI($question: String!, $technology: String!) {
    askAI(question: $question, technology: $technology) {
      answer
      warning
      isTechnical
      suggestions
      sources {
        source
        score
      }
    }
  }
`

const ANALYZE_IMAGE = gql`
  mutation AnalyzeImage($imageUrl: String!, $question: String!, $technology: String) {
    analyzeImage(imageUrl: $imageUrl, question: $question, technology: $technology) {
      answer
      imageDescription
      extractedText
      sources {
        source
        score
      }
      generatedAt
    }
  }
`

export function useAIChat() {
  const messages = ref<ChatMessage[]>([])
  const queryInitialized = ref(false)

  const { load: executeAI, loading: queryLoading, refetch } = useLazyQuery(ASK_AI, undefined, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  })

  const { mutate: analyzeImageMutation, loading: imageAnalysisLoading } = useMutation(ANALYZE_IMAGE)

  const hasMessages = computed(() => messages.value.length > 0)

  async function uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('http://localhost:4000/upload-image', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    return await response.json()
  }

  async function askAI(
    question: string,
    technology: string,
    imageFile?: File,
    imagePreviewUrl?: string
  ): Promise<string> {
    if (!question.trim() && !imageFile) return ''

    const messageId = Date.now().toString()
    const questionText = question.trim()
    const hasImage = imageFile !== null

    // Create user message
    const userMessage: ChatMessage = {
      id: messageId,
      question: questionText || 'Проаналізуй це зображення',
      answer: '',
      sources: [],
      timestamp: new Date(),
      technology: technology,
      imageUrl: hasImage ? imagePreviewUrl : undefined
    }
    
    messages.value.push(userMessage)

    try {
      if (hasImage && imageFile) {
        // Handle image analysis
        const uploadResult = await uploadImage(imageFile)
        
        const analysisResult = await analyzeImageMutation({
          imageUrl: uploadResult.imageUrl,
          question: questionText || 'Що на цьому зображенні?',
          technology: technology
        })

        if (analysisResult?.data?.analyzeImage) {
          const analysis = analysisResult.data.analyzeImage
          const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
          
          if (messageIndex !== -1) {
            messages.value[messageIndex] = {
              ...messages.value[messageIndex],
              answer: analysis.answer,
              imageDescription: analysis.imageDescription,
              extractedText: analysis.extractedText,
              sources: analysis.sources || [],
            }
          }
        }
      } else {
        // Handle regular text query
        const variables = {
          question: questionText,
          technology: technology,
        }
        
        let result
        
        if (!queryInitialized.value) {
          const executeResult = await executeAI(undefined, variables)
          queryInitialized.value = true
          result = executeResult
        } else {
          const refetchResult = await refetch(variables)
          result = refetchResult?.data
        }
        
        if (!result) return messageId

        let aiResponse = null

        if (result?.askAI?.answer) {
          aiResponse = result.askAI
        } else if (result?.answer) {
          aiResponse = result
        } else {
          throw new Error(`Не знайдено відповідь в результаті запиту`)
        }

        if (aiResponse?.answer) {
          const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
          if (messageIndex !== -1) {
            const currentMessage = messages.value[messageIndex]
            
            if (!currentMessage.answer || currentMessage.answer === '') {
              messages.value[messageIndex] = {
                ...currentMessage,
                answer: aiResponse.answer,
                sources: aiResponse.sources || [],
              }
            }
          }

          // Return validation info for parent component
          return JSON.stringify({
            messageId,
            warning: aiResponse.warning,
            isTechnical: aiResponse.isTechnical,
            suggestions: aiResponse.suggestions
          })
        }
      }
      
    } catch (error) {
      const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          answer: `Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}. Спробуйте ще раз.`,
          sources: [],
        }
      }
    }

    return messageId
  }

  function isMessageLoading(message: ChatMessage): boolean {
    return !message.answer && !message.answer.includes('❌')
  }

  return {
    messages,
    hasMessages,
    queryLoading,
    imageAnalysisLoading,
    askAI,
    isMessageLoading
  }
} 