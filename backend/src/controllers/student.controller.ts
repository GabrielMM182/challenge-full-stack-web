import { Request, Response, NextFunction } from 'express';
import {
  createStudent,
  findStudentById,
  updateStudent,
  deleteStudent,
  findStudents,
} from '../services/student.service';
import {
  StudentCreateInput,
  StudentUpdateInput,
  StudentFilters,
} from '../types/student.types';
import { PaginationParams } from '../types/common.types';
import { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../types/common.types';

export const createStudentHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const studentData: StudentCreateInput = req.body;
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
       res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const student = await createStudent(studentData, user.id);

    res.status(201).json({
      success: true,
      data: student,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentsHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const sortBy = req.query['sortBy'] as string;
    const sortOrder = (req.query['sortOrder'] as string) === 'desc' ? 'desc' : 'asc';

    const pagination: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const filters: StudentFilters = {
      name: req.query['name'] as string,
      email: req.query['email'] as string,
      ra: req.query['ra'] as string,
      cpf: req.query['cpf'] as string,
      search: req.query['search'] as string,
    };

    Object.keys(filters).forEach(key => {
      if (filters[key as keyof StudentFilters] === undefined) {
        delete filters[key as keyof StudentFilters];
      }
    });

    const result = await findStudents(filters, pagination);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentByIdHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
       res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Student ID is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const student = await findStudentById(id as string);

    res.status(200).json({
      success: true,
      data: student,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: StudentUpdateInput = req.body;
    const user = (req as AuthenticatedRequest).user;

    if (!id) {
       res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Student ID is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!user) {
       res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const student = await updateStudent(id as string, updateData, user.id);

    res.status(200).json({
      success: true,
      data: student,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentHandler = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;

    if (!id) {
       res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Student ID is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!user) {
       res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    await deleteStudent(id as string, user.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};