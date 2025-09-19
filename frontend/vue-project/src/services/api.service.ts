import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: string
}

export class ApiService {
  private axiosInstance: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => this.handleResponseError(error)
    )
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    const { response, request, message } = error

    console.error('[API Error]', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      message,
    })

    if (response) {
      const status = response.status
      const errorData = response.data as any

      const backendMessage = errorData?.error?.message || errorData?.message

      switch (status) {
        case 400:
          throw new Error(backendMessage || 'Dados inválidos fornecidos')
        case 401:
          this.clearAuthToken()
          throw new Error(backendMessage || 'Sessão expirada. Faça login novamente.')
        case 403:
          throw new Error(backendMessage || 'Acesso negado')
        case 404:
          throw new Error(backendMessage || 'Recurso não encontrado')
        case 409:
          throw new Error(backendMessage || 'Conflito de dados')
        case 422:
          throw new Error(backendMessage || 'Dados de validação inválidos')
        case 429:
          throw new Error(backendMessage || 'Muitas tentativas. Tente novamente mais tarde.')
        case 500:
          throw new Error(backendMessage || 'Erro interno do servidor. Tente novamente.')
        default:
          throw new Error(backendMessage || `Erro do servidor: ${status}`)
      }
    } else if (request) {
      if (message.includes('timeout')) {
        throw new Error('Tempo limite da requisição excedido. Verifique sua conexão.')
      } else if (message.includes('Network Error')) {
        throw new Error('Erro de rede. Verifique sua conexão com a internet.')
      } else {
        throw new Error('Erro de conexão com o servidor.')
      }
    } else {
      throw new Error('Erro inesperado. Tente novamente.')
    }
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  public setAuthToken(token: string): void {
    this.authToken = token
    localStorage.setItem('auth_token', token)
  }

  public clearAuthToken(): void {
    this.authToken = null
    localStorage.removeItem('auth_token')
  }

  public getAuthToken(): string | null {
    if (this.authToken) {
      return this.authToken
    }

    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      this.authToken = storedToken
      return storedToken
    }

    return null
  }

  public isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  public initializeAuth(): void {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      this.authToken = storedToken
    }
  }
}

export const apiService = new ApiService()

apiService.initializeAuth()