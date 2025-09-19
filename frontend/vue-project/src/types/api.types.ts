export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: any
}

export interface RequestConfig {
  timeout?: number
  headers?: Record<string, string>
  params?: Record<string, any>
}