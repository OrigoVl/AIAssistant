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

// Code Search Types
export interface CodeSearchResult {
  results: SearchResultWithDetails[]
  totalFound: number
  executionTimeMs: number
  technologiesSearched: string[]
  strategiesUsed: string[]
  recommendations?: string
  warning?: string
  isTechnical: boolean
  suggestions?: string[]
}

export interface SearchResultWithDetails {
  document: DocumentResult
  score: number
  matchType: string
  matchDetails?: string
}

export interface QueryValidationResult {
  isTechnical: boolean
  warning?: string
  suggestions?: string[]
}

export interface CodeTechnologyInfo {
  value: string
  label: string
  description: string
}

export interface CodeSearchOptions {
  technologies?: string[]
  codeType?: 'documentation' | 'issue' | 'example'
  strategies?: string[]
  ensembleMethod?: string
  skipTechnicalValidation?: boolean
  limit?: number
}

export const CODE_SEARCH_TYPES = {
  GENERAL: 'general',
  DOCUMENTATION: 'documentation',
  ISSUES: 'issues',
  API: 'api',
  TROUBLESHOOTING: 'troubleshooting',
  BY_TECHNOLOGY: 'by_technology'
} as const

export type CodeSearchType = typeof CODE_SEARCH_TYPES[keyof typeof CODE_SEARCH_TYPES] 
