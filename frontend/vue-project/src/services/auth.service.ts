import { apiService } from './api.service'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth.types'

export class AuthService {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials)
        if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token)
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const { confirmPassword, ...registrationData } = userData
    
      const response = await apiService.post<AuthResponse>('/auth/register', registrationData)
      
      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token)
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  logout(): void {
    apiService.clearAuthToken()
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<{ success: boolean; data: User }>('/auth/me')
      
      if (response.success) {
        return response.data
      }
      
      throw new Error('Failed to get current user')
    } catch (error) {
      throw error
    }
  }

  isAuthenticated(): boolean {
    return apiService.isAuthenticated()
  }

  getToken(): string | null {
    return apiService.getAuthToken()
  }

  initializeAuth(): void {
    apiService.initializeAuth()
  }
}

export const authService = new AuthService()