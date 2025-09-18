import {
  UserRegisterInput,
  UserResponse,
  Role,
} from '../types/auth.types';
import {
  findUserById as findUserByIdRepo,
  findUserByIdWithPassword,
  updateUser as updateUserRepo,
  deleteUser as deleteUserRepo,
  findAllUsers as findAllUsersRepo,
  updateUserRole as updateUserRoleRepo,
  checkEmailExists,
} from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class UserConflictError extends Error {
  constructor(field: string, value: string) {
    super(`User with ${field} '${value}' already exists`);
    this.name = 'UserConflictError';
  }
}

export class UserValidationError extends Error {
  constructor(message: string, public details?: any[]) {
    super(message);
    this.name = 'UserValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized operation') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'InvalidPasswordError';
  }
}

export const findUserById = async (id: string): Promise<UserResponse> => {
  const user = await findUserByIdRepo(id);
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; email?: string },
  requestingUserId: string
): Promise<UserResponse> => {
  const existingUser = await findUserByIdRepo(id);
  if (!existingUser) {
    throw new UserNotFoundError(id);
  }

  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser) {
    throw new UnauthorizedError('Invalid requesting user');
  }

  if (requestingUser.id !== id && requestingUser.role !== Role.SUPER_ADMIN) {
    throw new UnauthorizedError('You can only update your own profile');
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await checkEmailExists(data.email, id);
    if (emailExists) {
      throw new UserConflictError('email', data.email);
    }
  }

  if (data.name && (data.name.trim().length < 2 || data.name.trim().length > 100)) {
    throw new UserValidationError('Name must be between 2 and 100 characters');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new UserValidationError('Invalid email format');
  }

  try {
    const updatedUser = await updateUserRepo(id, data as Partial<UserRegisterInput>);
    if (!updatedUser) {
      throw new UserNotFoundError(id);
    }
    return updatedUser;
  } catch (error) {
    if (error instanceof UserNotFoundError || error instanceof UserConflictError || error instanceof UserValidationError) {
      throw error;
    }
    throw new Error('Failed to update user profile');
  }
};

export const changeUserPassword = async (
  id: string,
  currentPassword: string,
  newPassword: string,
  requestingUserId: string
): Promise<void> => {
  const existingUser = await findUserByIdWithPassword(id);
  if (!existingUser) {
    throw new UserNotFoundError(id);
  }

  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser) {
    throw new UnauthorizedError('Invalid requesting user');
  }

  if (requestingUser.id !== id && requestingUser.role !== Role.SUPER_ADMIN) {
    throw new UnauthorizedError('You can only change your own password');
  }

  if (requestingUser.id === id) {
    const isCurrentPasswordValid = await comparePassword(currentPassword, existingUser.password);
    if (!isCurrentPasswordValid) {
      throw new InvalidPasswordError();
    }
  }

  try {
    const hashedNewPassword = await hashPassword(newPassword);

    await updateUserRepo(id, { password: hashedNewPassword } as Partial<UserRegisterInput>);
  } catch (error) {
    if (error instanceof InvalidPasswordError) {
      throw error;
    }
    throw new Error('Failed to change password');
  }
};


export const deleteUser = async (id: string, requestingUserId: string): Promise<void> => {
  const existingUser = await findUserByIdRepo(id);
  if (!existingUser) {
    throw new UserNotFoundError(id);
  }

  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser || requestingUser.role !== Role.SUPER_ADMIN) {
    throw new UnauthorizedError('Only super admins can delete users');
  }

  if (requestingUser.id === id) {
    throw new UnauthorizedError('You cannot delete your own account');
  }

  try {
    const deleted = await deleteUserRepo(id);
    if (!deleted) {
      throw new UserNotFoundError(id);
    }
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw error;
    }
    throw new Error('Failed to delete user');
  }
};


export const getAllUsers = async (requestingUserId: string): Promise<UserResponse[]> => {
  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser) {
    throw new UnauthorizedError('Only admins can view all users');
  }

  try {
    return await findAllUsersRepo();
  } catch (error) {
    throw new Error('Failed to retrieve users');
  }
};

export const updateUserRole = async (
  id: string,
  newRole: Role,
  requestingUserId: string
): Promise<UserResponse> => {
  const existingUser = await findUserByIdRepo(id);
  if (!existingUser) {
    throw new UserNotFoundError(id);
  }

  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser || requestingUser.role !== Role.SUPER_ADMIN) {
    throw new UnauthorizedError('Only super admins can change user roles');
  }

  if (requestingUser.id === id) {
    throw new UnauthorizedError('You cannot change your own role');
  }

  if (!Object.values(Role).includes(newRole)) {
    throw new UserValidationError('Invalid role specified');
  }

  try {
    const updatedUser = await updateUserRoleRepo(id, newRole);
    if (!updatedUser) {
      throw new UserNotFoundError(id);
    }
    return updatedUser;
  } catch (error) {
    if (error instanceof UserNotFoundError || error instanceof UserValidationError) {
      throw error;
    }
    throw new Error('Failed to update user role');
  }
};

export const userExists = async (id: string): Promise<boolean> => {
  try {
    const user = await findUserByIdRepo(id);
    return !!user;
  } catch (error) {
    return false;
  }
};


export const getUserProfile = async (id: string, requestingUserId: string): Promise<UserResponse> => {
  const user = await findUserByIdRepo(id);
  if (!user) {
    throw new UserNotFoundError(id);
  }

  const requestingUser = await findUserByIdRepo(requestingUserId);
  if (!requestingUser) {
    throw new UnauthorizedError('Invalid requesting user');
  }

  if (requestingUser.id !== id && requestingUser.role !== Role.ADMIN && requestingUser.role !== Role.SUPER_ADMIN) {
    throw new UnauthorizedError('You can only view your own profile');
  }

  return user;
};