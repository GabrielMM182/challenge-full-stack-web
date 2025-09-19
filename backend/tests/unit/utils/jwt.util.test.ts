import { generateToken, verifyToken, decodeToken, extractTokenFromHeader, isTokenExpired } from '../../../src/utils/jwt.util';

process.env['JWT_SECRET'] = 'test-secret-key';
process.env['JWT_EXPIRES_IN'] = '1h';

describe('JWT Utility Functions', () => {
  const mockPayload = {
    userId: 'user123',
    email: 'test@example.com'
  };

  describe('generateToken', () => {
    test('should generate a valid JWT token', async () => {
      const token = await generateToken(mockPayload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); 
    });

    test('should generate token even with empty payload', async () => {
      const token = await generateToken({} as any);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    test('should verify and decode a valid token', async () => {
      const token = await generateToken(mockPayload);
      const decoded = await verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    test('should throw error for invalid token', async () => {
      await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });

    test('should throw error for malformed token', async () => {
      await expect(verifyToken('not.a.token')).rejects.toThrow('Invalid token');
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verification', async () => {
      const token = await generateToken(mockPayload);
      const decoded = decodeToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(mockPayload.userId);
      expect(decoded!.email).toBe(mockPayload.email);
    });

    test('should return null for invalid token', () => {
      const decoded = decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    test('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const header = `Bearer ${token}`;
      
      expect(extractTokenFromHeader(header)).toBe(token);
    });

    test('should return null for invalid header format', () => {
      expect(extractTokenFromHeader('InvalidHeader token')).toBeNull();
      expect(extractTokenFromHeader('Bearer')).toBeNull();
      expect(extractTokenFromHeader('Bearer ')).toBeNull();
    });

    test('should return null for undefined header', () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    test('should return false for valid non-expired token', async () => {
      const token = await generateToken(mockPayload);
      expect(isTokenExpired(token)).toBe(false);
    });

    test('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    test('should return true for malformed token', () => {
      expect(isTokenExpired('not.a.token')).toBe(true);
    });
  });
});