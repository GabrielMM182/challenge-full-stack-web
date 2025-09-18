import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  deleteUser,
  checkEmailExists,
  findAllUsers,
  updateUserRole,
  initializePrisma,
} from '../../../src/repositories/user.repository';
import { UserRegisterInput, Role } from '../../../src/types/auth.types';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  studentUser: {
    findMany: jest.fn(),
  },
} as any;

describe('User Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializePrisma(mockPrisma);
  });

  const mockUser = {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'hashedPassword123',
    role: Role.ADMIN,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  describe('createUser', () => {
    it('should create a user with default ADMIN role', async () => {
      const userData: UserRegisterInput = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashedPassword123',
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: Role.ADMIN,
        },
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email including password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await findUserByEmail('admin@test.com');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'admin@test.com',
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await findUserByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should find user by id excluding password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await findUserById('user-1');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deletedAt: null,
        },
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await findUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findUserByIdWithPassword', () => {
    it('should find user by id including password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await findUserByIdWithPassword('user-1');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updateData = {
        name: 'Updated Admin User',
        email: 'updated.admin@test.com',
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
        updatedAt: new Date('2024-01-02'),
      });

      const result = await updateUser('user-1', updateData);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deletedAt: null,
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe(updateData.name);
      expect(result?.email).toBe(updateData.email);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await updateUser('non-existent', { name: 'Test' });

      expect(result).toBeNull();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await deleteUser('user-1');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deletedAt: null,
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await deleteUser('non-existent');

      expect(result).toBe(false);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('checkEmailExists', () => {
    it('should return true if email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await checkEmailExists('admin@test.com');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'admin@test.com',
          deletedAt: null,
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await checkEmailExists('nonexistent@test.com');

      expect(result).toBe(false);
    });

    it('should exclude specific user ID when provided', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await checkEmailExists('admin@test.com', 'exclude-id');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'admin@test.com',
          deletedAt: null,
          id: { not: 'exclude-id' },
        },
      });
    });
  });

  describe('findAllUsers', () => {
    it('should find all users excluding passwords', async () => {
      const mockUsers = [mockUser];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await findAllUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual([
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ]);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        role: Role.SUPER_ADMIN,
        updatedAt: new Date('2024-01-02'),
      });

      const result = await updateUserRole('user-1', Role.SUPER_ADMIN);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deletedAt: null,
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          role: Role.SUPER_ADMIN,
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toBeDefined();
      expect(result?.role).toBe(Role.SUPER_ADMIN);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await updateUserRole('non-existent', Role.SUPER_ADMIN);

      expect(result).toBeNull();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});