<template>
  <div class="ai-assistant">
    <!-- Technology Sidebar -->
    <div class="tech-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Технології</h3>
      </div>
      <div class="tech-buttons">
        <button
          v-for="tech in technologies"
          :key="tech.value"
          :class="[
            'tech-button',
            { 'tech-button-active': selectedTech === tech.value }
          ]"
          @click="selectedTech = tech.value"
        >
          <span class="tech-icon">
            {{ getTechIcon(tech.value) }}
          </span>
          <span class="tech-label">{{ tech.label }}</span>
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Chat Container -->
      <div class="chat-container">
        <!-- Messages -->
        <div 
          ref="chatContainer"
          class="messages-container"
        >
          <!-- Empty State -->
          <div v-if="!hasMessages" class="empty-state">
            <h2>Як можу допомогти з {{ currentTechnology?.label }}?</h2>
          </div>

          <!-- Messages -->
          <div 
            v-for="message in messages" 
            :key="message.id" 
            class="message-group fade-in"
          >
            <!-- User Question -->
            <div class="user-message">
              <div class="message-content">
                <!-- User Image if exists -->
                <div v-if="message.imageUrl" class="message-image">
                  <img :src="getImageUrl(message.imageUrl)" alt="User uploaded image" />
                </div>
                {{ message.question }}
              </div>
            </div>

            <!-- AI Answer -->
            <div class="assistant-message">
              <div class="assistant-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="message-content">
                <!-- Loading State -->
                <div v-if="isMessageLoading(message)" class="loading">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                
                <!-- Image Description -->
                <div v-if="message.imageDescription" class="image-description">
                  <strong>Опис зображення:</strong> {{ message.imageDescription }}
                </div>
                
                <!-- Extracted Text -->
                <div v-if="message.extractedText" class="extracted-text">
                  <strong>Витягнутий текст:</strong>
                  <pre>{{ message.extractedText }}</pre>
                </div>
                
                <!-- Answer Content -->
                <div 
                  v-if="message.answer" 
                  class="message-text"
                  v-html="renderMarkdown(message.answer)"
                />
                
                <!-- Sources -->
                <div v-if="message.answer && message.sources.length > 0" class="sources">
                  <div class="sources-title">Джерела:</div>
                  <div class="sources-list">
                    <a
                      v-for="(source, idx) in message.sources"
                      :key="idx"
                      :href="source.source"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="source-link"
                    >
                      {{ idx + 1 }}. {{ getSourceDomain(source.source) }}
                    </a>
                  </div>
                </div>
                
                <!-- Message Actions -->
                <div v-if="message.answer && !isMessageLoading(message)" class="message-actions">
                  <button class="action-btn" title="Копіювати" @click="copyMessage(message.answer)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <!-- Image Upload Area -->
            <div v-if="showImageUpload" class="image-upload-area">
              <ImageUpload 
                @upload="handleImageUpload"
                @remove="handleImageRemove"
              />
            </div>
            
            <div class="input-wrapper"
                 :class="{ 'drag-over': isDragOver }"
                 @drop="handleDrop"
                 @dragover="handleDragOver"
                 @dragleave="handleDragLeave">
              <!-- Image Preview -->
              <div v-if="selectedImage" class="image-preview">
                <img :src="imagePreviewUrl" alt="Preview" class="preview-image" />
                <button @click="removeImage" class="remove-image-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Input Controls Row -->
              <div class="input-controls">
                <textarea
                  v-model="newQuestion"
                  class="message-input"
                  :placeholder="selectedImage ? 'Опишіть що ви хочете дізнатися про це зображення...' : 'Запитайте будь-що'"
                  rows="1"
                  :disabled="queryLoading || imageAnalysisLoading"
                  @keydown="handleKeyDown"
                />
                
                <!-- Image Upload Button -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="file-input"
                />
                <button
                  @click="triggerFileSelect"
                  class="image-upload-btn"
                  title="Завантажити зображення"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                
                <button
                  @click="askAI"
                  :disabled="(!newQuestion.trim() && !selectedImage) || queryLoading || imageAnalysisLoading"
                  class="send-button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="input-actions">
              <button class="input-action-btn" @click="toggleImageUpload" title="Завантажити зображення">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ selectedImage ? 'Зображення обрано' : 'Додати зображення' }}
              </button>
            </div>
          </div>
          
          <!-- Disclaimer -->
          <div class="disclaimer">
            AI Assistant може помилятися. Перевіряйте важливу інформацію.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import MarkdownIt from 'markdown-it'
import ImageUpload from './ImageUpload.vue'
import type { Technology, ChatMessage, AIResponse, ImageAnalysisResponse, ImageUploadResponse } from '@/types'

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

// Technology configuration
const technologies = ref<Technology[]>([
  { value: 'vue', label: 'Vue.js', color: '', icon: '' },
  { value: 'node', label: 'Node.js', color: '', icon: '' },
  { value: 'typescript', label: 'TypeScript', color: '', icon: '' },
  { value: 'grapesjs', label: 'GrapesJS', color: '', icon: '' },
])

// Reactive state
const selectedTech = ref<string>('vue')
const newQuestion = ref<string>('')
const messages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// Image handling state
const selectedImage = ref<File | null>(null)
const imagePreviewUrl = ref<string>('')
const isDragOver = ref<boolean>(false)
const showImageUpload = ref<boolean>(false)

// Computed properties
const currentTechnology = computed(() => 
  technologies.value.find(tech => tech.value === selectedTech.value)
)

const hasMessages = computed(() => messages.value.length > 0)

// GraphQL Queries and Mutations
const ASK_AI = gql`
  query AskAI($question: String!, $technology: String!) {
    askAI(question: $question, technology: $technology) {
      answer
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

const { load: executeAI, loading: queryLoading, refetch } = useLazyQuery(ASK_AI, undefined, {
  fetchPolicy: 'network-only',
  errorPolicy: 'all'
})

const { mutate: analyzeImageMutation, loading: imageAnalysisLoading } = useMutation(ANALYZE_IMAGE)

// Track if query has been loaded at least once
const queryInitialized = ref(false)

// Image handling methods
function triggerFileSelect(): void {
  fileInput.value?.click()
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    setSelectedImage(file)
  }
}

function setSelectedImage(file: File): void {
  selectedImage.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  showImageUpload.value = false
}

function removeImage(): void {
  selectedImage.value = null
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function toggleImageUpload(): void {
  showImageUpload.value = !showImageUpload.value
}

// Drag and drop handlers
function handleDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(): void {
  isDragOver.value = false
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  const imageFile = files.find(file => file.type.startsWith('image/'))
  
  if (imageFile) {
    setSelectedImage(imageFile)
  }
}

// Upload image to server
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

function getImageUrl(imagePath: string): string {
  // Convert server path to URL
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `http://localhost:4000/uploads/${imagePath.split('/').pop()}`
}

// Image Upload component handlers
function handleImageUpload(file: File, imageUrl: string): void {
  selectedImage.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  showImageUpload.value = false
}

function handleImageRemove(): void {
  removeImage()
}

// Main AI interaction method
async function askAI(): Promise<void> {
  const questionText = newQuestion.value.trim()
  const hasImage = selectedImage.value !== null
  
  if (!questionText && !hasImage) return
  if (queryLoading.value || imageAnalysisLoading.value) return

  const messageId = Date.now().toString()
  newQuestion.value = ''

  // Create user message
  const userMessage: ChatMessage = {
    id: messageId,
    question: questionText || 'Проаналізуй це зображення',
    answer: '',
    sources: [],
    timestamp: new Date(),
    technology: selectedTech.value,
    imageUrl: hasImage ? imagePreviewUrl.value : undefined
  }
  
  messages.value.push(userMessage)
  await scrollToBottom()

  try {
    if (hasImage) {
      // Handle image analysis
      const uploadResult = await uploadImage(selectedImage.value!)
      
      const analysisResult = await analyzeImageMutation({
        imageUrl: uploadResult.imageUrl,
        question: questionText || 'Що на цьому зображенні?',
        technology: selectedTech.value
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
        technology: selectedTech.value,
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
      
      if (!result) return

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
  } finally {
    // Clean up image after processing
    if (hasImage) {
      removeImage()
    }
  }
  
  await scrollToBottom()
}

function getSourceDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

async function scrollToBottom(): Promise<void> {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    askAI()
  }
}

function isMessageLoading(message: ChatMessage): boolean {
  return !message.answer && !message.answer.includes('❌')
}

async function copyMessage(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.message-input') as HTMLTextAreaElement
    input?.focus()
  })
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  
  let decoded = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  const rendered = md.render(decoded)
  return rendered
}

function getTechIcon(tech: string): string {
  const icons: Record<string, string> = {
    vue: '🟢',
    node: '🟩', 
    typescript: '🔷',
    grapesjs: '🎨'
  }
  return icons[tech] || '🔧'
}
</script>

<style scoped>
.ai-assistant {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
}

/* Technology Sidebar */
.tech-sidebar {
  width: 280px;
  padding: var(--space-4);
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface);
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: var(--space-4);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.tech-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tech-button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-align: left;
  width: 100%;
}

.tech-button:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

.tech-button-active {
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}

.tech-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.tech-label {
  flex: 1;
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

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  margin: 0;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* User Message */
.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-message .message-content {
  max-width: 70%;
  padding: var(--space-4);
  background-color: var(--color-message-user);
  color: var(--color-text);
  border-radius: var(--radius-2xl);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

/* Assistant Message */
.assistant-message {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-accent);
  color: var(--color-background);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assistant-message .message-content {
  flex: 1;
  color: var(--color-text);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

/* Loading */
.loading {
  padding: var(--space-2) 0;
}

.typing-indicator {
  display: flex;
  gap: var(--space-1);
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: var(--color-text-muted);
  border-radius: var(--radius-full);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* Sources */
.sources {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.sources-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.source-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

/* Message Actions */
.message-actions {
  margin-top: var(--space-3);
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-base);
  padding: var(--space-1);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

/* Image Display in Messages */
.message-image {
  margin-bottom: var(--space-2);
}

.message-image img {
  max-width: 300px;
  max-height: 200px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.image-description {
  background-color: var(--color-surface-variant);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  border-left: 4px solid var(--color-accent);
}

.extracted-text {
  background-color: var(--color-code-bg);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  border-left: 4px solid var(--color-accent);
}

.extracted-text pre {
  color: var(--color-text);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  margin: 0;
}

/* Input Area */
.input-area {
  padding: var(--space-4);
  margin-bottom: 20px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.input-container {
  max-width: 768px;
  margin: 0 auto;
}

.image-upload-area {
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-lg);
  transition: var(--transition);
  position: relative;
}

.input-wrapper.drag-over {
  border-color: var(--color-accent);
  background-color: rgba(25, 195, 125, 0.1);
}

.input-wrapper:focus-within {
  border-color: var(--color-accent);
}

/* Image Preview in Input */
.image-preview {
  position: relative;
  align-self: flex-start;
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.remove-image-btn:hover {
  background-color: var(--color-accent-hover);
}

/* Input Controls Row */
.input-controls {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
  width: 100%;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-base);
  resize: none;
  outline: none;
  min-height: 24px;
  max-height: 120px;
  line-height: var(--line-height-normal);
}

.message-input::placeholder {
  color: var(--color-text-muted);
}

/* File Input */
.file-input {
  display: none;
}

/* Upload Button */
.image-upload-btn {
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-upload-btn:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

.send-button {
  width: 32px;
  height: 32px;
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.send-button:disabled {
  background-color: var(--color-accent-disabled);
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-3);
}

.input-action-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.input-action-btn:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

/* Disclaimer */
.disclaimer {
  text-align: center;
  margin-top: var(--space-3);
  padding: 0 var(--space-4);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

/* Responsive */
@media (max-width: 768px) {
  .ai-assistant {
    flex-direction: column;
  }
  
  .tech-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-3);
  }
  
  .tech-buttons {
    flex-direction: row;
    gap: var(--space-1);
    overflow-x: auto;
    padding-bottom: var(--space-1);
  }
  
  .tech-button {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
    min-width: fit-content;
  }
  
  .tech-icon {
    font-size: var(--font-size-base);
  }
  
  .chat-main {
    max-width: 100%;
  }
  
  .chat-container {
    max-width: 100%;
  }
  
  .messages-container {
    padding: var(--space-4) var(--space-3);
    gap: var(--space-4);
  }
  
  .user-message .message-content {
    max-width: 85%;
  }
  
  .input-area {
    padding: var(--space-3);
  }
  
  .empty-state h2 {
    font-size: var(--font-size-xl);
  }
}
</style>
