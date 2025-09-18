import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../types/common.types';

export const validateSchema = <T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      (req as any)[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationErrors,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during validation',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};

export const validateBody = <T extends z.ZodTypeAny>(schema: T) => validateSchema(schema, 'body');
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => validateSchema(schema, 'query');
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => validateSchema(schema, 'params');