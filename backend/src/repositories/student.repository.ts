import { PrismaClient } from '@prisma/client';
import { StudentCreateInput, StudentUpdateInput, StudentResponse, StudentFilters } from '../types/student.types';
import { PaginationParams, PaginatedResponse } from '../types/common.types';
import { Action } from '../types/auth.types';

let prisma: PrismaClient;

export const initializePrisma = (client?: PrismaClient) => {
  prisma = client || new PrismaClient();
};

initializePrisma();

const transformStudent = (student: any): StudentResponse => ({
  id: student.id,
  name: student.name,
  email: student.email,
  ra: student.ra,
  cpf: student.cpf,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

export const createStudent = async (
  data: StudentCreateInput,
  userId: string
): Promise<StudentResponse> => {
  const student = await prisma.student.create({
    data: {
      name: data.name,
      email: data.email,
      ra: data.ra,
      cpf: data.cpf,
      studentUsers: {
        create: {
          userId,
          action: Action.CREATED,
        },
      },
    },
  });

  return transformStudent(student);
};

export const findStudentById = async (id: string): Promise<StudentResponse | null> => {
  const student = await prisma.student.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  return student ? transformStudent(student) : null;
};

export const updateStudent = async (
  id: string,
  data: StudentUpdateInput,
  userId: string
): Promise<StudentResponse | null> => {
  const existingStudent = await prisma.student.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingStudent) {
    return null;
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
      studentUsers: {
        create: {
          userId,
          action: Action.UPDATED,
        },
      },
    },
  });

  return transformStudent(student);
};

export const deleteStudent = async (id: string, userId: string): Promise<boolean> => {
  const existingStudent = await prisma.student.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingStudent) {
    return false;
  }

  await prisma.student.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      studentUsers: {
        create: {
          userId,
          action: Action.DELETED,
        },
      },
    },
  });

  return true;
};

const buildWhereClause = (filters: StudentFilters): any => {
  const where: any = {
    deletedAt: null,
  };
  if (filters.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }

  if (filters.email) {
    where.email = {
      contains: filters.email,
      mode: 'insensitive',
    };
  }

  if (filters.ra) {
    where.ra = {
      contains: filters.ra,
      mode: 'insensitive',
    };
  }

  if (filters.cpf) {
    where.cpf = {
      contains: filters.cpf,
      mode: 'insensitive',
    };
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};

export const findStudents = async (
  filters: StudentFilters,
  pagination: PaginationParams
): Promise<PaginatedResponse<StudentResponse>> => {
  const where = buildWhereClause(filters);

  const orderBy: any = {};
  if (pagination.sortBy) {
    orderBy[pagination.sortBy] = pagination.sortOrder || 'asc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: pagination.limit,
    }),
    prisma.student.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pagination.limit);

  return {
    data: students.map(transformStudent),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
    },
  };
};

export const findStudentByRA = async (ra: string, excludeId?: string): Promise<any | null> => {
  return prisma.student.findFirst({
    where: {
      ra,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
};

export const findStudentByCPF = async (cpf: string, excludeId?: string): Promise<any | null> => {
  return prisma.student.findFirst({
    where: {
      cpf,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
};

export const findStudentByEmail = async (email: string, excludeId?: string): Promise<any | null> => {
  return prisma.student.findFirst({
    where: {
      email,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
};

