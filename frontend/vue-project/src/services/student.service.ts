import { apiService } from './api.service'
import type { ApiResponse, Student, StudentListResponse, StudentQueryParams } from '@/types'

export class StudentService {
  private readonly baseUrl = '/students'

  async getStudents(params?: StudentQueryParams): Promise<StudentListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value))
          }
        })
      }
      
      const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl
      const response = await apiService.get<ApiResponse<StudentListResponse>>(url)
      
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Erro ao buscar estudantes')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  }

  async getStudent(id: string): Promise<Student> {
    try {
      const response = await apiService.get<ApiResponse<Student>>(`${this.baseUrl}/${id}`)
      
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Erro ao buscar estudante')
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  }
}

export const studentService = new StudentService()