import { apiService } from './api.service'
import type { ApiResponse, Student, StudentListResponse, StudentQueryParams } from '@/types'
import type { StudentCreateInput, StudentUpdateInput } from '@/validation'

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

  async createStudent(data: StudentCreateInput): Promise<Student> {
    try {
      const response = await apiService.post<ApiResponse<Student>>(this.baseUrl, data)
      
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Erro ao criar estudante')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  async updateStudent(id: string, data: StudentUpdateInput): Promise<Student> {
    try {
      const response = await apiService.put<ApiResponse<Student>>(`${this.baseUrl}/${id}`, data)
      
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Erro ao atualizar estudante')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`)

    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  }
}

export const studentService = new StudentService()