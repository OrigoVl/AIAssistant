<template>
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
           :class="{ 
             'drag-over': isDragOver,
             'input-error': hasValidationError
           }"
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
            v-model="question"
            class="message-input"
            :placeholder="placeholder"
            rows="1"
            :disabled="isLoading"
            @keydown="handleKeyDown"
            @input="handleInput"
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
            @click="handleSend"
            :disabled="isDisabled"
            class="send-button"
            :title="isQueryBlocked ? 'Запит не є технічним' : 'Відправити повідомлення'"
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
      AI Assistant працює з технічними запитами про програмування. Може помилятися. Перевіряйте важливу інформацію.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUpload from './ImageUpload.vue'
import type { Technology } from '@/types'

interface Props {
  selectedImage: File | null
  imagePreviewUrl: string
  isDragOver: boolean
  showImageUpload: boolean
  currentTechnology?: Technology
  hasValidationError: boolean
  isQueryBlocked: boolean
  isLoading: boolean
}

interface Emits {
  (e: 'send', question: string): void
  (e: 'input-change', question: string): void
  (e: 'image-upload', file: File, imageUrl: string): void
  (e: 'image-remove'): void
  (e: 'file-select', event: Event): void
  (e: 'drag-over', event: DragEvent): void
  (e: 'drag-leave'): void
  (e: 'drop', event: DragEvent): void
  (e: 'remove-image'): void
  (e: 'toggle-image-upload'): void
  (e: 'trigger-file-select'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const question = ref<string>('')
const fileInput = ref<HTMLInputElement>()

const placeholder = computed(() => {
  if (props.selectedImage) {
    return 'Опишіть що ви хочете дізнатися про це зображення...'
  }
  
  if (props.hasValidationError) {
    return 'Введіть технічний запит про програмування...'
  }
  
  return `Запитайте про ${props.currentTechnology?.label || 'програмування'}`
})

const isDisabled = computed(() => {
  return (!question.value.trim() && !props.selectedImage) || props.isLoading || props.isQueryBlocked
})

function handleSend(): void {
  if (!isDisabled.value) {
    emit('send', question.value.trim())
    question.value = ''
  }
}

function handleInput(): void {
  emit('input-change', question.value)
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleImageUpload(file: File, imageUrl: string): void {
  emit('image-upload', file, imageUrl)
}

function handleImageRemove(): void {
  emit('image-remove')
}

function handleFileSelect(event: Event): void {
  emit('file-select', event)
}

function handleDragOver(event: DragEvent): void {
  emit('drag-over', event)
}

function handleDragLeave(): void {
  emit('drag-leave')
}

function handleDrop(event: DragEvent): void {
  emit('drop', event)
}

function removeImage(): void {
  emit('remove-image')
}

function toggleImageUpload(): void {
  emit('toggle-image-upload')
}

function triggerFileSelect(): void {
  emit('trigger-file-select')
}
</script>

<style scoped>
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

.input-wrapper.input-error {
  border-color: #ef4444;
  background-color: rgba(255, 100, 100, 0.1);
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
  .input-area {
    padding: var(--space-3);
  }
}
</style> 