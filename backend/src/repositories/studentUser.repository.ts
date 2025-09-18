import { PrismaClient, StudentUser } from '@prisma/client';
import { Action } from '../types/auth.types';

let prisma: PrismaClient;

export const initializePrisma = (client?: PrismaClient) => {
  prisma = client || new PrismaClient();
};

initializePrisma();

export const createStudentUserRelation = async (
  userId: string,
  studentId: string,
  action: Action
): Promise<StudentUser> => {
  return prisma.studentUser.create({
    data: {
      userId,
      studentId,
      action,
    },
  });
};