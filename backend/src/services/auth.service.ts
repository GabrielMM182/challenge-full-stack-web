import {
  UserRegisterInput,
  UserLoginInput,
  UserResponse,
  AuthResponse,
} from '../types/auth.types';
import {
  createUser as createUserRepo,
  findUserByEmail,
  checkEmailExists,
} from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { validateUserRegisterSafe, validateUserLoginSafe } from '../validation/auth.validation';
import {
  AuthenticationError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  AuthValidationError,
} from '../errors';

export const registerUser = async (data: UserRegisterInput): Promise<AuthResponse> => {
  const validation = validateUserRegisterSafe(data);
  if (!validation.success) {
    throw new AuthValidationError(
      'Invalid registration data',
      validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    );
  }

  const emailExists = await checkEmailExists(data.email);
  if (emailExists) {
    throw new UserAlreadyExistsError(data.email);
  }

  try {
    const hashedPassword = await hashPassword(data.password);
    const userData = {
      ...data,
      password: hashedPassword,
    };

    const user = await createUserRepo(userData);

    const token = await generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user,
    };
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      throw error;
    }
    throw new Error('Failed to register user');
  }
};

export const loginUser = async (data: UserLoginInput): Promise<AuthResponse> => {
  const validation = validateUserLoginSafe(data);
  if (!validation.success) {
    throw new AuthValidationError(
      'Invalid login data',
      validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    );
  }

  try {
    const userWithPassword = await findUserByEmail(data.email);
    if (!userWithPassword) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await comparePassword(data.password, userWithPassword.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const user: UserResponse = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      createdAt: userWithPassword.createdAt,
      updatedAt: userWithPassword.updatedAt,
    };

    const token = await generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user,
    };
  } catch (error) {
    if (error instanceof InvalidCredentialsError || error instanceof AuthValidationError) {
      throw error;
    }
    throw new AuthenticationError('Login failed');
  }
};

export const validateCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    const userWithPassword = await findUserByEmail(email);
    if (!userWithPassword) {
      return false;
    }

    return await comparePassword(password, userWithPassword.password);
  } catch (error) {
    return false;
  }
};

export const userExists = async (email: string): Promise<boolean> => {
  try {
    return await checkEmailExists(email);
  } catch (error) {
    return false;
  }
};

export const validateRegistrationData = (data: UserRegisterInput): { isValid: boolean; errors?: any[] } => {
  const validation = validateUserRegisterSafe(data);
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

export const validateLoginData = (data: UserLoginInput): { isValid: boolean; errors?: any[] } => {
  const validation = validateUserLoginSafe(data);
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