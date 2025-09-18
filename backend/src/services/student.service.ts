import {
  StudentCreateInput,
  StudentUpdateInput,
  StudentResponse,
  StudentFilters,
} from '../types/student.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import {
  createStudent as createStudentRepo,
  findStudentById as findStudentByIdRepo,
  updateStudent as updateStudentRepo,
  deleteStudent as deleteStudentRepo,
  findStudents as findStudentsRepo,
  findStudentByRA,
  findStudentByCPF,
  findStudentByEmail,
} from '../repositories/student.repository';
import { validateStudentCreateSafe, validateStudentUpdateSafe } from '../validation/student.validation';
import {
  StudentNotFoundError,
  StudentConflictError,
  StudentValidationError,
} from '../errors';


export const createStudent = async (
  data: StudentCreateInput,
  userId: string
): Promise<StudentResponse> => {
  const validation = validateStudentCreateSafe(data);
  if (!validation.success) {
    throw new StudentValidationError(
      'Invalid student data',
      validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    );
  }

  const existingRA = await findStudentByRA(data.ra);
  if (existingRA) {
    throw new StudentConflictError('RA', data.ra);
  }

  const existingCPF = await findStudentByCPF(data.cpf);
  if (existingCPF) {
    throw new StudentConflictError('CPF', data.cpf);
  }

  const existingEmail = await findStudentByEmail(data.email);
  if (existingEmail) {
    throw new StudentConflictError('email', data.email);
  }

  try {
    return await createStudentRepo(data, userId);
  } catch (error) {
    throw new Error('Failed to create student');
  }
};

export const findStudentById = async (id: string): Promise<StudentResponse> => {
  const student = await findStudentByIdRepo(id);
  if (!student) {
    throw new StudentNotFoundError(id);
  }
  return student;
};

export const updateStudent = async (
  id: string,
  data: StudentUpdateInput,
  userId: string
): Promise<StudentResponse> => {
  const validation = validateStudentUpdateSafe(data);
  if (!validation.success) {
    throw new StudentValidationError(
      'Invalid student update data',
      validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    );
  }

  const existingStudent = await findStudentByIdRepo(id);
  if (!existingStudent) {
    throw new StudentNotFoundError(id);
  }

  if (data.email && data.email !== existingStudent.email) {
    const existingEmail = await findStudentByEmail(data.email, id);
    if (existingEmail) {
      throw new StudentConflictError('email', data.email);
    }
  }

  try {
    const updatedStudent = await updateStudentRepo(id, data, userId);
    if (!updatedStudent) {
      throw new StudentNotFoundError(id);
    }
    return updatedStudent;
  } catch (error) {
    if (error instanceof StudentNotFoundError) {
      throw error;
    }
    throw new Error('Failed to update student');
  }
};

export const deleteStudent = async (id: string, userId: string): Promise<void> => {
  const existingStudent = await findStudentByIdRepo(id);
  if (!existingStudent) {
    throw new StudentNotFoundError(id);
  }

  try {
    const deleted = await deleteStudentRepo(id, userId);
    if (!deleted) {
      throw new StudentNotFoundError(id);
    }
  } catch (error) {
    if (error instanceof StudentNotFoundError) {
      throw error;
    }
    throw new Error('Failed to delete student');
  }
};


export const findStudents = async (
  filters: StudentFilters,
  pagination: PaginationParams
): Promise<PaginatedResponse<StudentResponse>> => {
  if (pagination.page < 1) {
    throw new StudentValidationError('Page must be greater than 0');
  }
  if (pagination.limit < 1 || pagination.limit > 100) {
    throw new StudentValidationError('Limit must be between 1 and 100');
  }

  const validSortFields = ['name', 'email', 'ra', 'cpf', 'createdAt', 'updatedAt'];
  if (pagination.sortBy && !validSortFields.includes(pagination.sortBy)) {
    throw new StudentValidationError(`Invalid sort field. Valid fields: ${validSortFields.join(', ')}`);
  }

  try {
    return await findStudentsRepo(filters, pagination);
  } catch (error) {
    throw new Error('Failed to retrieve students');
  }
};

export const studentExists = async (id: string): Promise<boolean> => {
  try {
    const student = await findStudentByIdRepo(id);
    return !!student;
  } catch (error) {
    return false;
  }
};

export const validateStudentData = (data: StudentCreateInput): { isValid: boolean; errors?: any[] } => {
  const validation = validateStudentCreateSafe(data);
  if (validation.success) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    errors: validation.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  };
};