import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { LoginCredentials, RegisterData, User, AuthState } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true
    try {
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      token.value = null
      user.value = null
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    isLoading.value = true
    try {
      const response = await authService.register(userData)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      token.value = null
      user.value = null
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = (): void => {
    authService.logout()
    token.value = null
    user.value = null
  }

  const checkAuth = async (): Promise<void> => {
    const storedToken = authService.getToken()
    
    if (!storedToken) {
      token.value = null
      user.value = null
      return
    }

    isLoading.value = true
    try {
      const currentUser = await authService.getCurrentUser()
      token.value = storedToken
      user.value = currentUser
    } catch (error) {
      authService.logout()
      token.value = null
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  const initializeAuth = async (): Promise<void> => {
    authService.initializeAuth()
    
    const storedToken = authService.getToken()
    if (storedToken) {
      token.value = storedToken
      await checkAuth()
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    initializeAuth
  }
})