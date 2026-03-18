import { Token, ASTNode, ArrayNode, ComparisonOperator } from './types';
import { ConditionError } from './utils';

export class Parser {
  private position = 0;

  constructor(private tokens: Token[]) {}

  parse(): ASTNode {
    const expression = this.parseOrExpression();
    if (!this.isAtEnd()) {
      throw this.createError(`Unexpected token "${this.peek()?.value}"`);
    }
    return expression;
  }

  private parseOrExpression(): ASTNode {
    let left = this.parseAndExpression();
    while (this.matchKeyword('OR')) {
      left = { type: 'logical', operator: 'OR', left, right: this.parseAndExpression() };
    }
    return left;
  }

  private parseAndExpression(): ASTNode {
    let left = this.parseUnaryExpression();
    while (this.matchKeyword('AND')) {
      left = { type: 'logical', operator: 'AND', left, right: this.parseUnaryExpression() };
    }
    return left;
  }

  private parseUnaryExpression(): ASTNode {
    if (this.matchKeyword('NOT')) {
      return { type: 'unary', operator: 'NOT', argument: this.parseUnaryExpression() };
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): ASTNode {
    if (this.matchPunctuation('(')) {
      const expression = this.parseOrExpression();
      this.expectPunctuation(')');
      return expression;
    }
    return this.parseComparisonExpression();
  }

  private parseComparisonExpression(): ASTNode {
    const left = this.parseValue();

    if (this.matchKeyword('IS')) {
      const isNotNull = this.matchKeyword('NOT');
      this.expectNull();
      return { type: 'comparison', operator: isNotNull ? 'IS NOT NULL' : 'IS NULL', left };
    }

    if (this.peekKeyword('NOT') && this.peekKeyword('IN', 1)) {
      this.consume();
      this.consume();
      return { type: 'comparison', operator: 'NOT IN', left, right: this.parseValue() };
    }

    if (this.matchKeyword('IN')) {
      return { type: 'comparison', operator: 'IN', left, right: this.parseValue() };
    }

    const operator = this.matchOperator(['=', '==', '!=', '<>', '>', '>=', '<', '<=']) as ComparisonOperator | null;
    if (operator) {
      return { type: 'comparison', operator, left, right: this.parseValue() };
    }

    return { type: 'truthy', value: left };
  }

  private parseValue(): ASTNode {
    const token = this.peek();
    if (!token) throw this.createError('Unexpected end of condition');

    if (this.matchPunctuation('[')) return this.parseArrayValue();

    if (token.type === 'NUMBER' || token.type === 'STRING' || token.type === 'BOOLEAN' || token.type === 'NULL') {
      this.consume();
      return { type: 'literal', value: token.value };
    }

    if (token.type === 'IDENTIFIER') {
      this.consume();
      return { type: 'identifier', path: token.value };
    }

    throw this.createError(`Unexpected token "${token.value}"`);
  }

  private parseArrayValue(): ArrayNode {
    const items: ASTNode[] = [];
    if (this.matchPunctuation(']')) return { type: 'array', items };

    do {
      items.push(this.parseValue());
    } while (this.matchPunctuation(','));

    this.expectPunctuation(']');
    return { type: 'array', items };
  }

  private matchKeyword(keyword: string): boolean {
    if (!this.peekKeyword(keyword)) return false;
    this.position++;
    return true;
  }

  private peekKeyword(keyword: string, offset = 0): boolean {
    const token = this.peek(offset);
    return !!token && token.type === 'KEYWORD' && token.value === keyword;
  }

  private expectNull() {
    const token = this.peek();
    if (!token || token.type !== 'NULL') throw this.createError('Expected NULL');
    this.position++;
  }

  private matchPunctuation(value: string): boolean {
    const token = this.peek();
    if (!token || token.type !== 'PUNCTUATION' || token.value !== value) return false;
    this.position++;
    return true;
  }

  private expectPunctuation(value: string) {
    if (!this.matchPunctuation(value)) throw this.createError(`Expected token "${value}"`);
  }

  private matchOperator(operators: string[]): string | null {
    const token = this.peek();
    if (!token || token.type !== 'OPERATOR' || !operators.includes(token.value as string)) return null;
    this.position++;
    return token.value;
  }

  private consume(): Token {
    const token = this.peek();
    if (!token) throw this.createError('Unexpected end of condition');
    this.position++;
    return token;
  }

  private peek(offset = 0): Token | null {
    return this.tokens[this.position + offset] || null;
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length;
  }

  private createError(message: string): ConditionError {
    const token = this.peek();
    return new ConditionError(message, token?.position);
  }
}
