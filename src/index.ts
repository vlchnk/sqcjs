import { ASTNode, ComparisonNode, EvaluationContext } from './types';
import { tokenize } from './lexer';
import { Parser } from './parser';
import { getByPath, isNumericLike, ConditionError } from './utils';

export * from './types';
export * from './utils';
export { tokenize, Parser };

export function evaluateCondition(condition: string, context: EvaluationContext = {}): boolean {
  if (typeof condition !== 'string' || !condition.trim()) {
    throw new Error('Parameter condition should be a non-empty string');
  }

  const tokens = tokenize(condition);
  const parser = new Parser(tokens);
  const ast = parser.parse();

  return Boolean(evaluateNode(ast, context));
}

export function evaluateNode(node: ASTNode, context: EvaluationContext): any {
  switch (node.type) {
    case 'logical':
      if (node.operator === 'AND') {
        return Boolean(evaluateNode(node.left, context)) && Boolean(evaluateNode(node.right, context));
      }
      return Boolean(evaluateNode(node.left, context)) || Boolean(evaluateNode(node.right, context));

    case 'unary':
      return !evaluateNode(node.argument, context);

    case 'comparison':
      return evaluateComparison(node, context);

    case 'truthy':
      return Boolean(resolveValue(node.value, context));

    case 'literal':
    case 'identifier':
    case 'array':
      return resolveValue(node, context);

    default:
      const _exhaustiveCheck: never = node;
      throw new Error(`Unsupported AST node type`);
  }
}

function evaluateComparison(node: ComparisonNode, context: EvaluationContext): boolean {
  const left = resolveValue(node.left, context);
  const right = node.right ? resolveValue(node.right, context) : undefined;

  switch (node.operator) {
    case '=':
    case '==': return isEqualValue(left, right);
    case '!=':
    case '<>': return !isEqualValue(left, right);
    case '>': return isComparable(left, right) && compareValues(left, right) > 0;
    case '>=': return isComparable(left, right) && compareValues(left, right) >= 0;
    case '<': return isComparable(left, right) && compareValues(left, right) < 0;
    case '<=': return isComparable(left, right) && compareValues(left, right) <= 0;
    case 'IN': return isInCollection(left, right);
    case 'NOT IN': return !isInCollection(left, right);
    case 'IS NULL': return left == null;
    case 'IS NOT NULL': return left != null;
  }
}

function resolveValue(node: ASTNode, context: EvaluationContext): any {
  if (node.type === 'literal') return node.value;
  if (node.type === 'identifier') return getByPath(context, node.path);
  if (node.type === 'array') return node.items.map((item) => resolveValue(item, context));
  throw new Error(`Cannot resolve value for node type "${node.type}"`);
}

function isComparable(left: any, right: any): boolean {
  return left != null && right != null;
}

function isEqualValue(left: any, right: any): boolean {
  if (left == null || right == null) return left == null && right == null;

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    return left.every((item, index) => isEqualValue(item, right[index]));
  }

  if (left instanceof Date || right instanceof Date) {
    if (!(left instanceof Date) || !(right instanceof Date)) return false;
    return left.getTime() === right.getTime();
  }

  if (isNumericLike(left) && isNumericLike(right)) return Number(left) === Number(right);
  return left === right;
}

function compareValues(left: any, right: any): number {
  if (left == null || right == null) return Number.NEGATIVE_INFINITY;
  if (isNumericLike(left) && isNumericLike(right)) return Number(left) - Number(right);
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  if (typeof left === 'string' && typeof right === 'string') return left.localeCompare(right);
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);
  return String(left).localeCompare(String(right));
}

function isInCollection(value: any, collection: any): boolean {
  if (!Array.isArray(collection)) throw new ConditionError('Right side of IN operator should resolve to an array');
  if (Array.isArray(value)) {
    return value.some((item) => collection.some((candidate) => isEqualValue(item, candidate)));
  }
  return collection.some((candidate) => isEqualValue(value, candidate));
}

export default evaluateCondition;
