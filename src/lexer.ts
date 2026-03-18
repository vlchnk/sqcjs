import { Token } from './types';
import { ConditionError } from './utils';

const KEYWORDS = new Set(['AND', 'OR', 'NOT', 'IN', 'IS', 'TRUE', 'FALSE', 'NULL']);

export function tokenize(condition: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < condition.length) {
    const char = condition[position];

    if (/\s/.test(char)) {
      position++;
      continue;
    }

    if (['(', ')', '[', ']', ','].includes(char)) {
      tokens.push({ type: 'PUNCTUATION', value: char, position, end: position + 1 });
      position++;
      continue;
    }

    const doubleCharOperator = condition.slice(position, position + 2);
    if (['>=', '<=', '!=', '==', '<>'].includes(doubleCharOperator)) {
      tokens.push({ type: 'OPERATOR', value: doubleCharOperator, position, end: position + 2 });
      position += 2;
      continue;
    }

    if (['=', '>', '<'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char, position, end: position + 1 });
      position++;
      continue;
    }

    if (char === "'" || char === '"') {
      const { value, end } = readString(condition, position, char);
      tokens.push({ type: 'STRING', value, position, end });
      position = end;
      continue;
    }

    if ((char === '-' && /\d/.test(condition[position + 1] || '')) || /\d/.test(char)) {
      const { value, end } = readNumber(condition, position);
      tokens.push({ type: 'NUMBER', value, position, end });
      position = end;
      continue;
    }

    const { type, value, end } = readWord(condition, position);
    tokens.push({ type, value, position, end });
    position = end;
  }

  return tokens;
}

function readString(condition: string, start: number, quote: string) {
  let index = start + 1;
  let value = '';

  while (index < condition.length) {
    const char = condition[index];
    if (char === '\\') {
      const nextChar = condition[index + 1];
      if (nextChar === undefined) break;
      value += nextChar;
      index += 2;
      continue;
    }
    if (char === quote) {
      return { value, end: index + 1 };
    }
    value += char;
    index++;
  }
  throw new ConditionError(`Unterminated string`, start);
}

function readNumber(condition: string, start: number) {
  let index = start;
  let hasDot = false;

  if (condition[index] === '-') index++;

  while (index < condition.length) {
    const char = condition[index];
    if (char === '.') {
      if (hasDot) break;
      hasDot = true;
      index++;
      continue;
    }
    if (!/\d/.test(char)) break;
    index++;
  }

  return { value: Number(condition.slice(start, index)), end: index };
}

function readWord(condition: string, start: number) {
  let index = start;
  while (index < condition.length) {
    const char = condition[index];
    if (/\s/.test(char) || ['(', ')', ',', '=', '>', '<', '!', '"', "'"].includes(char)) break;
    index++;
  }

  const rawValue = condition.slice(start, index);
  const upperValue = rawValue.toUpperCase();

  if (upperValue === 'TRUE' || upperValue === 'FALSE') {
    return { type: 'BOOLEAN' as const, value: upperValue === 'TRUE', end: index };
  }
  if (upperValue === 'NULL') {
    return { type: 'NULL' as const, value: null, end: index };
  }
  if (KEYWORDS.has(upperValue)) {
    return { type: 'KEYWORD' as const, value: upperValue, end: index };
  }
  return { type: 'IDENTIFIER' as const, value: rawValue, end: index };
}
