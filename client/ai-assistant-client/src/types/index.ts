export interface Technology {
  value: string
  label: string
  color: string
  icon: string
}

export interface ChatMessage {
  id: string
  question: string
  answer: string
  sources: SourceDocument[]
  timestamp: Date
  technology: string
  imageUrl?: string
  imageDescription?: string
  extractedText?: string
}

export interface SourceDocument {
  content: string
  source: string
  score: number
  title?: string
}

export interface DocumentResult {
  id: string
  title: string
  content: string
  source: string
  type: string
  technology: string
  createdAt: string
}

export interface SearchResults {
  items: DocumentResult[]
  total: number
}

export interface AIResponse {
  answer: string
  sources: SourceDocument[]
  generatedAt: string
}

// Image Analysis Types
export interface ImageAnalysisResponse {
  answer: string
  imageDescription: string
  generatedAt: string
  sources: SourceDocument[]
  extractedText?: string
}

export interface ImageUploadResponse {
  success: boolean
  imageUrl: string
  filename: string
  originalname?: string
  size?: number
} 
