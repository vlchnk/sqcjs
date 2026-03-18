import { EvaluationContext } from './types';

export class ConditionError extends Error {
  constructor(message: string, public position?: number) {
    super(position !== undefined ? `${message} at position ${position}` : message);
    this.name = 'ConditionError';
  }
}

export function getByPath(obj: EvaluationContext, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;

  const normalizedPath = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
  const keys = normalizedPath.split('.');

  let current: any = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

export function isNumericLike(value: any): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  return value.trim() !== '' && Number.isFinite(Number(value));
}
