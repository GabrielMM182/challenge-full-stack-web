import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be a positive integer').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be a positive integer').max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'email', 'ra', 'cpf', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  name: z.string().optional(),
  email: z.string().optional(),
  ra: z.string().optional(),
  cpf: z.string().optional(),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const healthCheckSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  uptime: z.number(),
  database: z.enum(['connected', 'disconnected']),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.array(z.object({
        field: z.string(),
        message: z.string(),
      })).optional(),
    }).optional(),
    timestamp: z.string(),
  });

export const validatePagination = (data: unknown) => {
  return paginationSchema.parse(data);
};

export const validateStudentQuery = (data: unknown) => {
  return studentQuerySchema.parse(data);
};

export const validateIdParam = (data: unknown) => {
  return idParamSchema.parse(data);
};

export const validateHealthCheck = (data: unknown) => {
  return healthCheckSchema.parse(data);
};

export type PaginationParams = z.infer<typeof paginationSchema>;
export type StudentQueryParams = z.infer<typeof studentQuerySchema>;
export type IdParams = z.infer<typeof idParamSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>;