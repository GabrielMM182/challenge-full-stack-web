import { z } from 'zod';
import { passwordSchema } from '../utils/password.util';

const passwordValidator = passwordSchema;

const emailValidator = z.string()
  z.email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters');

const nameValidator = z.string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name must contain only letters and spaces');

export const userRegisterSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const userLoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordValidator,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'New password and confirmation password do not match',
    path: ['confirmPassword'],
  }
);

export const resetPasswordSchema = z.object({
  email: emailValidator,
});

export const tokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const validateUserRegister = (data: unknown) => {
  return userRegisterSchema.parse(data);
};

export const validateUserLogin = (data: unknown) => {
  return userLoginSchema.parse(data);
};

export const validateChangePassword = (data: unknown) => {
  return changePasswordSchema.parse(data);
};

export const validateResetPassword = (data: unknown) => {
  return resetPasswordSchema.parse(data);
};

export const validateToken = (data: unknown) => {
  return tokenSchema.parse(data);
};

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;