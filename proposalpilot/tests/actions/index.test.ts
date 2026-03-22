import { describe, it, expect } from 'vitest';

describe('Data Validation', () => {
  it('validates required string fields are not empty', () => {
    const validateRequired = (value: string) => value.trim().length > 0;
    expect(validateRequired('valid')).toBe(true);
    expect(validateRequired('')).toBe(false);
    expect(validateRequired('  ')).toBe(false);
  });

  it('validates email format', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  it('validates UUID format', () => {
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUUID('invalid')).toBe(false);
  });
});
