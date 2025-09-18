import { hashPassword, comparePassword, validatePasswordStrength, generateSalt, hashPasswordWithSalt } from '../../../src/utils/password.util';

describe('Password Utility Functions', () => {
  const testPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    test('should hash password successfully', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); 
    });

    test('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword(testPassword, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword('WrongPassword123!', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    test('should return false for invalid hash', async () => {
      const isMatch = await comparePassword(testPassword, 'invalid-hash');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject password that is too short', () => {
      const result = validatePasswordStrength('Short1!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    test('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('password123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject password without number', () => {
      const result = validatePasswordStrength('Password!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should reject common weak passwords', () => {
      const result = validatePasswordStrength('password');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is too common and easily guessable');
    });

    test('should reject password that is too long', () => {
      const longPassword = 'A'.repeat(129) + '1!';
      const result = validatePasswordStrength(longPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });
  });

  describe('hashPassword with validation', () => {
    test('should hash password after validation', async () => {
      const validPassword = 'ValidPass123!';
      const hashedPassword = await hashPassword(validPassword);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(validPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should throw error for invalid password', async () => {
      const invalidPassword = 'weak';
      
      await expect(hashPassword(invalidPassword)).rejects.toThrow('Password validation failed');
    });
  });

  describe('generateSalt', () => {
    test('should generate a salt string', async () => {
      const salt = await generateSalt();
      
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(20);
    });

    test('should generate different salts', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      
      expect(salt1).not.toBe(salt2);
    });

    test('should generate salt with custom rounds', async () => {
      const salt = await generateSalt(10);
      
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(20);
    });
  });

  describe('hashPasswordWithSalt', () => {
    test('should hash password with provided salt', async () => {
      const salt = await generateSalt();
      const hashedPassword = await hashPasswordWithSalt(testPassword, salt);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.startsWith(salt.substring(0, 7))).toBe(true);
    });

    test('should produce same hash with same salt', async () => {
      const salt = await generateSalt();
      const hash1 = await hashPasswordWithSalt(testPassword, salt);
      const hash2 = await hashPasswordWithSalt(testPassword, salt);
      
      expect(hash1).toBe(hash2);
    });
  });
});