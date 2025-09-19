export interface Student {
  id: string
  name: string
  email: string
  ra: string
  cpf: string
  createdAt: string
  updatedAt: string
}

export interface StudentListResponse {
  data: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StudentFilters {
  name?: string
  email?: string
  ra?: string
  cpf?: string
  search?: string
}

export interface StudentQueryParams extends StudentFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}