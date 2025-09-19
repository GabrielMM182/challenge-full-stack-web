import { useAuthStore } from '@/stores/auth.store'
import type { LoginCredentials, RegisterData } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()

  return {
    user: authStore.user,
    token: authStore.token,
    isLoading: authStore.isLoading,
    isAuthenticated: authStore.isAuthenticated,

    login: (credentials: LoginCredentials) => authStore.login(credentials),
    register: (userData: RegisterData) => authStore.register(userData),
    logout: () => authStore.logout(),
    checkAuth: () => authStore.checkAuth(),
    initializeAuth: () => authStore.initializeAuth()
  }
}