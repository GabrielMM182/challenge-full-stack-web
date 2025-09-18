import { validateCPF, formatCPF, cleanCPF } from '../../../src/utils/cpf.util';

describe('CPF Utility Functions', () => {
  describe('validateCPF', () => {
    test('should return true for valid CPF', () => {
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('123.456.789-09')).toBe(true);
    });

    test('should return false for invalid CPF', () => {
      expect(validateCPF('12345678901')).toBe(false);
      expect(validateCPF('111.444.777-36')).toBe(false);
      expect(validateCPF('123.456.789-10')).toBe(false);
    });

    test('should return false for CPF with all same digits', () => {
      expect(validateCPF('11111111111')).toBe(false);
      expect(validateCPF('222.222.222-22')).toBe(false);
      expect(validateCPF('333.333.333-33')).toBe(false);
    });

    test('should return false for CPF with wrong length', () => {
      expect(validateCPF('123456789')).toBe(false);
      expect(validateCPF('123456789012')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });

    test('should handle CPF with special characters', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('111 444 777 35')).toBe(true);
      expect(validateCPF('111/444/777-35')).toBe(true);
    });
  });

  describe('formatCPF', () => {
    test('should format valid CPF correctly', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
    });

    test('should return original string for invalid length', () => {
      expect(formatCPF('123456789')).toBe('123456789');
      expect(formatCPF('123456789012')).toBe('123456789012');
    });

    test('should format already formatted CPF', () => {
      expect(formatCPF('111.444.777-35')).toBe('111.444.777-35');
    });
  });

  describe('cleanCPF', () => {
    test('should remove all non-numeric characters', () => {
      expect(cleanCPF('111.444.777-35')).toBe('11144477735');
      expect(cleanCPF('111 444 777 35')).toBe('11144477735');
      expect(cleanCPF('111/444/777-35')).toBe('11144477735');
      expect(cleanCPF('111abc444def777ghi35')).toBe('11144477735');
    });

    test('should return same string if already clean', () => {
      expect(cleanCPF('11144477735')).toBe('11144477735');
    });
  });
});