# sqce.js

> **S**tructured **Q**uery **C**ondition **JS**

A lightweight, zero-dependency TypeScript/JavaScript library for evaluating SQL-like string conditions against JavaScript objects.

[![npm version](https://img.shields.io/npm/v/sqce.js.svg)](https://www.npmjs.com/package/sqce.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🪶 **Zero dependencies:** Extremely lightweight.
- 🛡️ **TypeScript ready:** Fully typed out of the box.
- 🔍 **SQL-like syntax:** Familiar operators (`AND`, `OR`, `IN`, `IS NULL`, etc.).
- 🌳 **Deep object access:** Supports nested properties (`user.profile.age`) and array indices (`users[0].name`).
- ⚡ **Universal:** Works in Node.js and the browser (CommonJS and ES Modules support).

## Installation

Install via npm, yarn, or pnpm:

```bash
npm install sqce.js
# or
yarn add sqce.js
# or
pnpm add sqce.js
````

## Quick Start

Import the `evaluateCondition` function and pass your query string along with the object (context) you want to test.

```typescript
import { evaluateCondition } from 'sqce.js';

const product = { 
  id: 66382856, 
  brand_id: 18, 
  status: 'active' 
};

// Simple comparison
const isActive = evaluateCondition("status = 'active'", product);
console.log(isActive); // true

// Complex logic with IN and OR
const query = "id IN [66382856, 66386717] OR brand_id = 100";
const isMatch = evaluateCondition(query, product);
console.log(isMatch); // true
```

## Accessing Nested Properties

You can seamlessly evaluate deeply nested data structures using dot notation or array brackets.

```typescript
const context = {
  user: {
    profile: { role: 'admin' },
    tags: ['premium', 'new']
  }
};

evaluateCondition("user.profile.role = 'admin'", context); // true
evaluateCondition("user.tags[0] = 'premium'", context); // true
```

## Supported Operators

`sqce.js` supports a wide range of standard logical and comparison operators.

### Comparison

| Operator | Example | Description |
| :--- | :--- | :--- |
| `=`, `==` | `age = 25` | Equality |
| `!=`, `<>` | `status != 'deleted'` | Inequality |
| `>`, `>=` | `price > 100` | Greater than (or equal to) |
| `<`, `<=` | `price <= 50` | Less than (or equal to) |
| `IN` | `id IN [1, 2, 3]` | Included in array |
| `NOT IN` | `id NOT IN [4, 5]` | Not included in array |
| `IS NULL` | `deletedAt IS NULL` | Strict null check |
| `IS NOT NULL`| `updatedAt IS NOT NULL` | Strict not-null check |

### Logical

| Operator | Example | Description |
| :--- | :--- | :--- |
| `AND` | `age > 18 AND status = 'active'`| True if both are true |
| `OR` | `role = 'admin' OR role = 'mod'`| True if either is true |
| `NOT` | `NOT (status = 'banned')` | Inverts the boolean result |

*(Parentheses `()` are fully supported to group logic and control evaluation precedence).*

## API Reference

### `evaluateCondition(condition: string, context?: Record<string, any>): boolean`

- **`condition`**: A string containing the SQL-like query to evaluate. Must not be empty.
- **`context`**: (Optional) The JavaScript object containing the data to test against the condition. Defaults to `{}`.
- **`Returns`**: `true` if the condition is met, `false` otherwise.

## License

[MIT](https://www.google.com/search?q=LICENSE)
