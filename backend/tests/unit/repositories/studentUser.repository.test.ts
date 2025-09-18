import {
  createStudentUserRelation,
  initializePrisma,
} from '../../../src/repositories/studentUser.repository';
import { Action } from '../../../src/types/auth.types';
const mockPrisma = {
  studentUser: {
    create: jest.fn(),
  },
} as any;

describe('StudentUser Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializePrisma(mockPrisma);
  });

  const mockStudentUser = {
    id: 'relation-1',
    userId: 'user-1',
    studentId: 'student-1',
    action: Action.CREATED,
    createdAt: new Date('2024-01-01'),
  };

  describe('createStudentUserRelation', () => {
    it('should create a student-user relationship record', async () => {
      mockPrisma.studentUser.create.mockResolvedValue(mockStudentUser);

      const result = await createStudentUserRelation('user-1', 'student-1', Action.CREATED);

      expect(mockPrisma.studentUser.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          studentId: 'student-1',
          action: Action.CREATED,
        },
      });

      expect(result).toBe(mockStudentUser);
    });
  });
});