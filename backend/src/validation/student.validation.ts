import { z } from 'zod';
import { validateCPF } from '../utils/cpf.util';

const cpfValidator = z.string().refine(
  (cpf) => {
    if (!cpf) return false;
    return validateCPF(cpf);
  },
  {
    message: 'Cpf must contain 11 digits without special characters and must be a valid cpf',
  }
);

const raValidator = z.string().regex(
  /^RA\d{6}$/,
  'RA must follow the format RA followed by 6 digits (e.g., RA123456)'
);

const emailValidator = z.email('Invalid email format');

const nameValidator = z.string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name must contain only letters and spaces');

export const studentCreateSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  ra: raValidator,
  cpf: cpfValidator,
});

export const studentUpdateSchema = z.object({
  name: nameValidator.optional(),
  email: emailValidator.optional(),
}).refine(
  (data) => data.name !== undefined || data.email !== undefined,
  {
    message: 'At least one field (name or email) must be provided for update',
  }
);

export const studentFiltersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  ra: z.string().optional(),
  cpf: z.string().optional(),
  search: z.string().optional(),
});

export const studentIdSchema = z.object({
  id: z.string().cuid('Invalid student ID format'),
});

export const validateStudentCreate = (data: unknown) => {
  return studentCreateSchema.parse(data);
};

export const validateStudentUpdate = (data: unknown) => {
  return studentUpdateSchema.parse(data);
};

export const validateStudentFilters = (data: unknown) => {
  return studentFiltersSchema.parse(data);
};

export const validateStudentId = (data: unknown) => {
  return studentIdSchema.parse(data);
};

export const validateStudentCreateSafe = (data: unknown) => {
  return studentCreateSchema.safeParse(data);
};

export const validateStudentUpdateSafe = (data: unknown) => {
  return studentUpdateSchema.safeParse(data);
};

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type StudentFilters = z.infer<typeof studentFiltersSchema>;
export type StudentIdParams = z.infer<typeof studentIdSchema>;