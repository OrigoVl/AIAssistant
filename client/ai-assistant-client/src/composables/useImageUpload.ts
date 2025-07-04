import { ref, computed } from 'vue'

export function useImageUpload() {
  const selectedImage = ref<File | null>(null)
  const imagePreviewUrl = ref<string>('')
  const isDragOver = ref<boolean>(false)
  const showImageUpload = ref<boolean>(false)
  const fileInput = ref<HTMLInputElement>()

  const hasImage = computed(() => selectedImage.value !== null)

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

  // Image Upload component handlers
  function handleImageUpload(file: File, imageUrl: string): void {
    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
    showImageUpload.value = false
  }

  function handleImageRemove(): void {
    removeImage()
  }

  function getImageUrl(imagePath: string): string {
    // Convert server path to URL
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    return `http://localhost:4000/uploads/${imagePath.split('/').pop()}`
  }

  return {
    selectedImage,
    imagePreviewUrl,
    isDragOver,
    showImageUpload,
    hasImage,
    fileInput,
    setSelectedImage,
    removeImage,
    toggleImageUpload,
    triggerFileSelect,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleImageUpload,
    handleImageRemove,
    getImageUrl
  }
} 