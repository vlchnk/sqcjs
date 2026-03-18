import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../src';

describe('sqce.js - evaluateCondition', () => {
  it('should evaluate simple equality', () => {
    expect(evaluateCondition('status = "active"', { status: 'active' })).toBe(true);
    expect(evaluateCondition('status == "active"', { status: 'pending' })).toBe(false);
  });

  it('should extract nested properties', () => {
    const data = { user: { profile: { age: 25 } } };
    expect(evaluateCondition('user.profile.age >= 18', data)).toBe(true);
  });

  it('should extract array properties', () => {
    const data = { users: [{ name: 'John' }, { name: 'Jane' }] };
    expect(evaluateCondition('users[0].name = "John"', data)).toBe(true);
  });

  it('should handle IN operator', () => {
    const data = { id: 66382856, brand_id: 18 };
    expect(evaluateCondition('id IN [66382856, 66386717]', data)).toBe(true);
    expect(evaluateCondition('brand_id IN [1, 2, 3]', data)).toBe(false);
  });

  it('should handle complex logical operations (AND / OR)', () => {
    const data = { id: 66382856, brand_id: 18 };
    const query = 'id IN [111, 222] OR brand_id = 18';
    expect(evaluateCondition(query, data)).toBe(true);
  });

  it('should throw on invalid syntax', () => {
    expect(() => evaluateCondition('id IN [111, 222', {})).toThrowError();
  });
});
