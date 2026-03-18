export type TokenType =
  | 'PUNCTUATION'
  | 'OPERATOR'
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'NULL'
  | 'KEYWORD'
  | 'IDENTIFIER';

export interface Token {
  type: TokenType;
  value: any;
  position: number;
  end: number;
}

export type LogicalOperator = 'AND' | 'OR';
export type ComparisonOperator = '=' | '==' | '!=' | '<>' | '>' | '>=' | '<' | '<=' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';

export interface LogicalNode { type: 'logical'; operator: LogicalOperator; left: ASTNode; right: ASTNode; }
export interface UnaryNode { type: 'unary'; operator: 'NOT'; argument: ASTNode; }
export interface ComparisonNode { type: 'comparison'; operator: ComparisonOperator; left: ASTNode; right?: ASTNode; }
export interface TruthyNode { type: 'truthy'; value: ASTNode; }
export interface LiteralNode { type: 'literal'; value: any; }
export interface IdentifierNode { type: 'identifier'; path: string; }
export interface ArrayNode { type: 'array'; items: ASTNode[]; }

export type ASTNode =
  | LogicalNode
  | UnaryNode
  | ComparisonNode
  | TruthyNode
  | LiteralNode
  | IdentifierNode
  | ArrayNode;

export type EvaluationContext = Record<string, any>;
