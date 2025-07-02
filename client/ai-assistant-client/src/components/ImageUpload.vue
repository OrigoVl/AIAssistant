<template>
  <div class="image-upload">
    <!-- File Input (Hidden) -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="file-input"
    />

    <!-- Drag and Drop Area -->
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileSelect"
    >
      <!-- Image Preview -->
      <div v-if="selectedImage" class="image-preview">
        <img :src="imagePreviewUrl" alt="Preview" class="preview-image" />
        <button @click.stop="removeImage" class="remove-image-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Upload Prompt -->
      <div v-else class="upload-prompt">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="upload-icon">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            stroke-width="2"
          />
          <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2" />
          <path
            d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        <h3>Завантажити зображення</h3>
        <p>Перетягніть файл сюди або натисніть для вибору</p>
        <p class="file-types">PNG, JPG, GIF до 10MB</p>
      </div>
    </div>

    <!-- Upload Button -->
    <button
      v-if="selectedImage && !isUploading"
      @click="uploadImage"
      class="upload-btn"
      :disabled="isUploading"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
          stroke="currentColor"
          stroke-width="2"
        />
        <polyline points="17,8 12,3 7,8" stroke="currentColor" stroke-width="2" />
        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" />
      </svg>
      Завантажити
    </button>

    <!-- Loading State -->
    <div v-if="isUploading" class="uploading">
      <div class="spinner"></div>
      <span>Завантаження...</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
interface Props {
  modelValue?: string
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10 * 1024 * 1024, // 10MB
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  upload: [file: File, imageUrl: string]
  remove: []
}>()

// State
const fileInput = ref<HTMLInputElement>()
const selectedImage = ref<File | null>(null)
const imagePreviewUrl = ref<string>('')
const isDragOver = ref<boolean>(false)
const isUploading = ref<boolean>(false)
const error = ref<string>('')

// Methods
function triggerFileSelect(): void {
  fileInput.value?.click()
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    setSelectedImage(file)
  }
}

function setSelectedImage(file: File): void {
  // Reset error
  error.value = ''

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Будь ласка, оберіть файл зображення'
    return
  }

  // Validate file size
  if (file.size > props.maxSize) {
    error.value = `Файл занадто великий. Максимальний розмір: ${Math.round(props.maxSize / 1024 / 1024)}MB`
    return
  }

  selectedImage.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
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
  error.value = ''
  emit('remove')
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
  const imageFile = files.find((file) => file.type.startsWith('image/'))

  if (imageFile) {
    setSelectedImage(imageFile)
  }
}

// Upload image to server
async function uploadImage(): Promise<void> {
  if (!selectedImage.value) return

  isUploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('image', selectedImage.value)

    const response = await fetch('http://localhost:4000/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Помилка завантаження')
    }

    const result = await response.json()

    if (result.success) {
      emit('update:modelValue', result.imageUrl)
      emit('upload', selectedImage.value, result.imageUrl)
    } else {
      throw new Error(result.error || 'Помилка завантаження')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Помилка завантаження'
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: var(--color-accent);
  background-color: var(--color-surface-variant);
}

.drop-zone.drag-over {
  border-color: var(--color-accent);
  background-color: rgba(25, 195, 125, 0.1);
}

.upload-prompt {
  color: var(--color-text-secondary);
}

.upload-icon {
  margin-bottom: var(--space-4);
  color: var(--color-text-muted);
}

.upload-prompt h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.upload-prompt p {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-sm);
}

.file-types {
  color: var(--color-text-muted) !important;
  font-size: var(--font-size-xs) !important;
}

.image-preview {
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-lg);
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
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

.upload-btn {
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.upload-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploading {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
