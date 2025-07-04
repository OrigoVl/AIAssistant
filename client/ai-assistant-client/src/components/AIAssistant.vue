<template>
  <div class="ai-assistant">
    <!-- Technology Sidebar -->
    <TechnologySidebar
      :technologies="technologies"
      :selected-tech="selectedTech"
      @select-technology="selectedTech = $event"
    />

    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Chat Container -->
      <div class="chat-container">
        <!-- Technical Query Warning -->
        <TechnicalValidationWarning
          :show="validation.showValidationWarning.value"
          :validation-result="validation.lastValidationResult.value"
          @close="validation.hideValidationWarning"
        />

        <!-- Messages -->
        <MessageList
          ref="messageList"
          :messages="chat.messages.value"
          :has-messages="chat.hasMessages.value"
          :current-technology="currentTechnology"
          :is-message-loading="chat.isMessageLoading"
        />

        <!-- Input Area -->
        <MessageInput
          :selected-image="imageUpload.selectedImage.value"
          :image-preview-url="imageUpload.imagePreviewUrl.value"
          :is-drag-over="imageUpload.isDragOver.value"
          :show-image-upload="imageUpload.showImageUpload.value"
          :current-technology="currentTechnology"
          :has-validation-error="hasValidationError"
          :is-query-blocked="isQueryBlocked"
          :is-loading="isLoading"
          @send="handleSend"
          @input-change="handleInputChange"
          @image-upload="imageUpload.handleImageUpload"
          @image-remove="imageUpload.handleImageRemove"
          @file-select="imageUpload.handleFileSelect"
          @drag-over="imageUpload.handleDragOver"
          @drag-leave="imageUpload.handleDragLeave"
          @drop="imageUpload.handleDrop"
          @remove-image="imageUpload.removeImage"
          @toggle-image-upload="imageUpload.toggleImageUpload"
          @trigger-file-select="imageUpload.triggerFileSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAIChat } from '@/composables/useAIChat'
import { useTechnicalValidation } from '@/composables/useTechnicalValidation'
import { useImageUpload } from '@/composables/useImageUpload'
import TechnologySidebar from './TechnologySidebar.vue'
import TechnicalValidationWarning from './TechnicalValidationWarning.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import type { Technology } from '@/types'

// Technology configuration
const technologies = ref<Technology[]>([
  { value: 'vue', label: 'Vue.js', color: '', icon: '' },
  { value: 'node', label: 'Node.js', color: '', icon: '' },
  { value: 'typescript', label: 'TypeScript', color: '', icon: '' },
  { value: 'grapesjs', label: 'GrapesJS', color: '', icon: '' },
])

// Core state
const selectedTech = ref<string>('vue')
const messageList = ref<InstanceType<typeof MessageList>>()

// Composables
const chat = useAIChat()
const validation = useTechnicalValidation()
const imageUpload = useImageUpload()

// Computed properties
const currentTechnology = computed(() =>
  technologies.value.find((tech) => tech.value === selectedTech.value),
)

const hasValidationError = computed(() => {
  return Boolean(
    validation.lastValidationResult.value?.warning &&
      !validation.lastValidationResult.value?.isTechnical &&
      !imageUpload.hasImage.value,
  )
})

const isQueryBlocked = computed(() => {
  return validation.isQueryBlocked(imageUpload.hasImage.value)
})

const isLoading = computed(() => {
  return chat.queryLoading.value || chat.imageAnalysisLoading.value
})

// Event handlers
async function handleSend(question: string): Promise<void> {
  if (!question.trim() && !imageUpload.selectedImage.value) return

  try {
    const result = await chat.askAI(
      question,
      selectedTech.value,
      imageUpload.selectedImage.value || undefined,
      imageUpload.imagePreviewUrl.value || undefined,
    )

    // Handle validation response for text queries
    if (result && !imageUpload.selectedImage.value) {
      try {
        const validationInfo = JSON.parse(result)
        if (validationInfo.warning || validationInfo.isTechnical !== undefined) {
          validation.updateValidationFromResponse(validationInfo)
        }
      } catch {
        // If parsing fails, it's just a regular message ID
      }
    }

    // Clean up image after processing
    if (imageUpload.selectedImage.value) {
      imageUpload.removeImage()
    }

    // Auto-scroll to bottom
    await scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

function handleInputChange(question: string): void {
  validation.handleInputChange(question)
}

async function scrollToBottom(): Promise<void> {
  await nextTick()
  messageList.value?.scrollToBottom()
}

// Focus input on mount
onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.message-input') as HTMLTextAreaElement
    input?.focus()
  })
})
</script>

<style scoped>
.ai-assistant {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-width: calc(100% - 280px);
}

/* Chat Container */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .ai-assistant {
    flex-direction: column;
  }

  .chat-main {
    max-width: 100%;
  }

  .chat-container {
    max-width: 100%;
  }
}
</style>
