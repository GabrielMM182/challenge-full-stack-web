import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SALT_ROUNDS = 12;

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', '123123'
];


export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Password is too common and easily guessable'
  );

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const result = passwordSchema.safeParse(password);
  
  if (result.success) {
    return {
      isValid: true,
      errors: []
    };
  }
  
  return {
    isValid: false,
    errors: result.error.issues.map((err: any) => err.message)
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
};

export const generateSalt = async (rounds: number = SALT_ROUNDS): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(rounds);
    return salt;
  } catch (error) {
    throw new Error('Failed to generate salt');
  }
};

export const hashPasswordWithSalt = async (password: string, salt: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password with salt');
  }
};