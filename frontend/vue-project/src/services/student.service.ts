import { apiService } from './api.service'
import type { ApiResponse, Student, StudentListResponse } from '@/types'

export class StudentService {
  private readonly baseUrl = '/students'

  async getStudents(): Promise<StudentListResponse> {
    try {
      const response = await apiService.get<ApiResponse<StudentListResponse>>(this.baseUrl)
      
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