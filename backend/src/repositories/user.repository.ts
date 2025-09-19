import { PrismaClient } from '@prisma/client';
import { UserRegisterInput, UserResponse } from '../types/auth.types';

let prisma: PrismaClient;

export const initializePrisma = (client?: PrismaClient) => {
  prisma = client || new PrismaClient();
};

initializePrisma();

const transformUser = (user: any): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createUser = async (data: UserRegisterInput): Promise<UserResponse> => {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });

  return transformUser(user);
};

export const findUserByEmail = async (email: string): Promise<any | null> => {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
};

export const findUserById = async (id: string): Promise<UserResponse | null> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  return user ? transformUser(user) : null;
};

export const findUserByIdWithPassword = async (id: string): Promise<any | null> => {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const updateUser = async (id: string, data: Partial<UserRegisterInput>): Promise<UserResponse | null> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  return transformUser(user);
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    return false;
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return true;
};

export const checkEmailExists = async (email: string, excludeId?: string): Promise<boolean> => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!user;
};

export const findAllUsers = async (): Promise<UserResponse[]> => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map(transformUser);
};



