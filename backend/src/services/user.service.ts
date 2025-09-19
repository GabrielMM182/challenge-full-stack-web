import {
  UserRegisterInput,
  UserResponse,
} from '../types/auth.types';
import {
  findUserById as findUserByIdRepo,
  findUserByIdWithPassword,
  updateUser as updateUserRepo,
  deleteUser as deleteUserRepo,
  findAllUsers as findAllUsersRepo,  checkEmailExists,
} from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  UserNotFoundError,
  UserConflictError,
  UserValidationError,
  UnauthorizedError,
  InvalidPasswordError,
} from '../errors';

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

  if (requestingUser.id !== id) {
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

  if (requestingUser.id !== id) {
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
  if (!requestingUser) {
    throw new UnauthorizedError('Only authenticated users can delete users');
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

  if (requestingUser.id !== id) {
    throw new UnauthorizedError('You can only view your own profile');
  }

  return user;
};