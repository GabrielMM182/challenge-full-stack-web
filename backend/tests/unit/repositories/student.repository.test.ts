import {
  createStudent,
  findStudentById,
  updateStudent,
  deleteStudent,
  findStudents,
  findStudentByRA,
  findStudentByCPF,
  findStudentByEmail,
  initializePrisma,
} from '../../../src/repositories/student.repository';
import { StudentCreateInput, StudentUpdateInput, StudentFilters } from '../../../src/types/student.types';
import { PaginationParams } from '../../../src/types/common.types';
import { Action } from '../../../src/types/auth.types';

const mockPrisma = {
  student: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  studentUser: {
    findMany: jest.fn(),
  },
} as any;

describe('Student Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializePrisma(mockPrisma);
  });

  const mockStudent = {
    id: 'student-1',
    name: 'João Silva',
    email: 'joao@test.com',
    ra: 'RA123456',
    cpf: '11144477735',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockUserId = 'user-1';

  describe('createStudent', () => {
    it('should create a student with user relationship', async () => {
      const studentData: StudentCreateInput = {
        name: 'João Silva',
        email: 'joao@test.com',
        ra: 'RA123456',
        cpf: '11144477735',
      };

      mockPrisma.student.create.mockResolvedValue(mockStudent);

      const result = await createStudent(studentData, mockUserId);

      expect(mockPrisma.student.create).toHaveBeenCalledWith({
        data: {
          name: studentData.name,
          email: studentData.email,
          ra: studentData.ra,
          cpf: studentData.cpf,
          studentUsers: {
            create: {
              userId: mockUserId,
              action: Action.CREATED,
            },
          },
        },
      });

      expect(result).toEqual({
        id: mockStudent.id,
        name: mockStudent.name,
        email: mockStudent.email,
        ra: mockStudent.ra,
        cpf: mockStudent.cpf,
        createdAt: mockStudent.createdAt,
        updatedAt: mockStudent.updatedAt,
      });
    });
  });

  describe('findStudentById', () => {
    it('should find student by id excluding soft deleted', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await findStudentById('student-1');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'student-1',
          deletedAt: null,
        },
      });

      expect(result).toEqual({
        id: mockStudent.id,
        name: mockStudent.name,
        email: mockStudent.email,
        ra: mockStudent.ra,
        cpf: mockStudent.cpf,
        createdAt: mockStudent.createdAt,
        updatedAt: mockStudent.updatedAt,
      });
    });

    it('should return null if student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await findStudentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateStudent', () => {
    it('should update student and create audit record', async () => {
      const updateData: StudentUpdateInput = {
        name: 'João Silva Updated',
        email: 'joao.updated@test.com',
      };

      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.student.update.mockResolvedValue({
        ...mockStudent,
        ...updateData,
        updatedAt: new Date('2024-01-02'),
      });

      const result = await updateStudent('student-1', updateData, mockUserId);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'student-1',
          deletedAt: null,
        },
      });

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
          studentUsers: {
            create: {
              userId: mockUserId,
              action: Action.UPDATED,
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe(updateData.name);
      expect(result?.email).toBe(updateData.email);
    });

    it('should return null if student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await updateStudent('non-existent', { name: 'Test' }, mockUserId);

      expect(result).toBeNull();
      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteStudent', () => {
    it('should soft delete student and create audit record', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.student.update.mockResolvedValue({
        ...mockStudent,
        deletedAt: new Date(),
      });

      const result = await deleteStudent('student-1', mockUserId);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'student-1',
          deletedAt: null,
        },
      });

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          deletedAt: expect.any(Date),
          studentUsers: {
            create: {
              userId: mockUserId,
              action: Action.DELETED,
            },
          },
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await deleteStudent('non-existent', mockUserId);

      expect(result).toBe(false);
      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });
  });

  describe('findStudents', () => {
    it('should find students with pagination and filtering', async () => {
      const filters: StudentFilters = {
        name: 'João',
        search: 'test',
      };

      const pagination: PaginationParams = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const mockStudents = [mockStudent];
      const mockTotal = 1;

      mockPrisma.student.findMany.mockResolvedValue(mockStudents);
      mockPrisma.student.count.mockResolvedValue(mockTotal);

      const result = await findStudents(filters, pagination);

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          name: {
            contains: 'João',
            mode: 'insensitive',
          },
          OR: [
            {
              name: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          name: 'asc',
        },
        skip: 0,
        take: 10,
      });

      expect(mockPrisma.student.count).toHaveBeenCalledWith({
        where: expect.any(Object),
      });

      expect(result).toEqual({
        data: [
          {
            id: mockStudent.id,
            name: mockStudent.name,
            email: mockStudent.email,
            ra: mockStudent.ra,
            cpf: mockStudent.cpf,
            createdAt: mockStudent.createdAt,
            updatedAt: mockStudent.updatedAt,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should use default sorting when no sortBy provided', async () => {
      const filters: StudentFilters = {};
      const pagination: PaginationParams = {
        page: 1,
        limit: 10,
      };

      mockPrisma.student.findMany.mockResolvedValue([]);
      mockPrisma.student.count.mockResolvedValue(0);

      await findStudents(filters, pagination);

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findStudentByRA', () => {
    it('should find student by RA excluding soft deleted', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await findStudentByRA('RA123456');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          ra: 'RA123456',
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockStudent);
    });

    it('should exclude specific ID when provided', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await findStudentByRA('RA123456', 'exclude-id');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          ra: 'RA123456',
          deletedAt: null,
          id: { not: 'exclude-id' },
        },
      });
    });
  });

  describe('findStudentByCPF', () => {
    it('should find student by CPF excluding soft deleted', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await findStudentByCPF('11144477735');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          cpf: '11144477735',
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockStudent);
    });
  });

  describe('findStudentByEmail', () => {
    it('should find student by email excluding soft deleted', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await findStudentByEmail('joao@test.com');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'joao@test.com',
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockStudent);
    });
  });

});