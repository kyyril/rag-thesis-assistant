import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - server tidak merespons'
    } else if (error.response?.status === 500) {
      error.message = 'Server error - silakan coba lagi nanti'
    } else if (error.response?.status === 404) {
      error.message = 'Endpoint tidak ditemukan'
    }
    return Promise.reject(error)
  }
)

// Types
export interface ChatRequest {
  question: string
  document_id?: string
  include_guidelines?: boolean
}

export interface ChatResponse {
  answer: string
  sources: Array<{
    source: string
    page?: number
    chapter?: string
    similarity_score: number
  }>
  processing_time: number
  timestamp: string
}

export interface UploadResponse {
  success: boolean
  message: string
  document_id?: string
  chunks_created?: number
}

export interface Document {
  id: string
  type: string
  name: string
  chunks_count: number
  namespace: string
}

export interface DocumentsResponse {
  documents: Document[]
  total_documents: number
  total_chunks: number
}

export interface HealthResponse {
  status: string
  timestamp: string
  version: string
  services: {
    vector_store: boolean
    gemini_api: boolean
    pdf_processor: boolean
  }
}

export interface SystemStatsResponse {
  vector_store: {
    total_documents: number
    namespace_distribution: Record<string, number>
    collection_name: string
  }
  gemini_connection: boolean
  available_namespaces: string[]
  status: string
}

// API Functions
export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get('/health')
  return response.data
}

export const uploadGuidelines = async (formData: FormData): Promise<UploadResponse> => {
  const response = await api.post('/upload/guidelines', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const uploadThesis = async (formData: FormData): Promise<UploadResponse> => {
  const response = await api.post('/upload/thesis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const chatWithAssistant = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await api.post('/chat', request)
  return response.data
}

export const getDocuments = async (): Promise<DocumentsResponse> => {
  const response = await api.get('/documents')
  return response.data
}

export const deleteDocument = async (documentId: string): Promise<{ success: boolean; message: string; deleted_chunks: number }> => {
  const response = await api.delete(`/documents/${documentId}`)
  return response.data
}

export const getSystemStats = async (): Promise<SystemStatsResponse> => {
  const response = await api.get('/stats')
  return response.data
}

export default api