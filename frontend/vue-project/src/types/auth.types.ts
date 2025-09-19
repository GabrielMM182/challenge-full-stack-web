export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export interface User {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

export interface AuthResponse {
    success: boolean
    data: {
        token: string
        user: User
    }
    timestamp: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
}