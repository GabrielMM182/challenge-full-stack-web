import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse, ErrorResponse, ValidationError } from '../types/common.types';
import { AppError } from '../errors';

const ErrorTypes = {
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data'
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    code: 'AUTHENTICATION_ERROR',
    message: 'Authentication required'
  },
  AUTHORIZATION_ERROR: {
    status: 403,
    code: 'AUTHORIZATION_ERROR',
    message: 'Insufficient permissions'
  },
  NOT_FOUND_ERROR: {
    status: 404,
    code: 'NOT_FOUND_ERROR',
    message: 'Resource not found'
  },
  CONFLICT_ERROR: {
    status: 409,
    code: 'CONFLICT_ERROR',
    message: 'Resource conflict'
  },
  RATE_LIMIT_ERROR: {
    status: 429,
    code: 'RATE_LIMIT_ERROR',
    message: 'Too many requests'
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error'
  }
} as const;

const mapErrorToResponse = (error: Error): { status: number; errorResponse: ErrorResponse } => {
  if (error instanceof AppError) {
    const details = (error as any).details || undefined;
    return {
      status: error.statusCode,
      errorResponse: {
        code: getErrorCode(error.statusCode),
        message: error.message,
        details
      }
    };
  }

  if (error instanceof ZodError) {
    const details: ValidationError[] = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return {
      status: ErrorTypes.VALIDATION_ERROR.status,
      errorResponse: {
        code: ErrorTypes.VALIDATION_ERROR.code,
        message: ErrorTypes.VALIDATION_ERROR.message,
        details
      }
    };
  }

  if (error.message.includes('Too many requests')) {
    return {
      status: ErrorTypes.RATE_LIMIT_ERROR.status,
      errorResponse: {
        code: ErrorTypes.RATE_LIMIT_ERROR.code,
        message: ErrorTypes.RATE_LIMIT_ERROR.message
      }
    };
  }

  return {
    status: ErrorTypes.INTERNAL_SERVER_ERROR.status,
    errorResponse: {
      code: ErrorTypes.INTERNAL_SERVER_ERROR.code,
      message: ErrorTypes.INTERNAL_SERVER_ERROR.message
    }
  };
};

const getErrorCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return ErrorTypes.VALIDATION_ERROR.code;
    case 401:
      return ErrorTypes.AUTHENTICATION_ERROR.code;
    case 403:
      return ErrorTypes.AUTHORIZATION_ERROR.code;
    case 404:
      return ErrorTypes.NOT_FOUND_ERROR.code;
    case 409:
      return ErrorTypes.CONFLICT_ERROR.code;
    case 429:
      return ErrorTypes.RATE_LIMIT_ERROR.code;
    default:
      return ErrorTypes.INTERNAL_SERVER_ERROR.code;
  }
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.id
  });

  const { status, errorResponse } = mapErrorToResponse(error);

  const response: ApiResponse = {
    success: false,
    error: errorResponse,
    timestamp: new Date().toISOString()
  };

  res.status(status).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorTypes.NOT_FOUND_ERROR.code,
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  };

  res.status(ErrorTypes.NOT_FOUND_ERROR.status).json(response);
};
