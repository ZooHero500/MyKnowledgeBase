# 函数

## 简介

TypeScript 中的函数是代码复用和抽象的基本单位。它们不仅可以组织和重用代码，还能通过类型注解提供更强的类型检查。

TypeScript 函数在 JavaScript 函数的基础上增加了类型注解，使得函数的输入和输出更加明确，代码更加健壮。

## 函数类型

TypeScript 允许我们为函数的参数和返回值指定类型。以下是一些复杂的实际场景示例：

### 1. 复杂对象参数和返回值

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserUpdateOptions {
  name?: string;
  email?: string;
}

function updateUser(user: User, options: UserUpdateOptions): User {
  return { ...user, ...options };
}
```

### 2. 函数作为参数

```typescript
type Comparator<T> = (a: T, b: T) => number;

function sortArray<T>(arr: T[], comparator: Comparator<T>): T[] {
  return [...arr].sort(comparator);
}
```

### 3. 泛型函数

```typescript
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}
```

### 4. 函数重载与联合类型

```typescript
function process(x: number): number;
function process(x: string): string;
function process(x: number | string): number | string {
  if (typeof x === "number") {
    return x * 2;
  } else {
    return x.toUpperCase();
  }
}
```

### 5. 异步函数与 Promise

```typescript
async function fetchUserData(id: number): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
```

## 可选参数、默认参数和剩余参数

TypeScript 支持可选参数、默认参数和剩余参数。以下是一些更复杂的示例：

### 1. 复杂的可选参数和默认参数

```typescript
interface Config {
  timeout: number;
  retries: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function setupConnection(
  url: string,
  { timeout = 5000, retries = 3, onSuccess, onError }: Config = { timeout: 5000, retries: 3 }
): void {
  // 实现连接逻辑
}
```

### 2. 剩余参数与元组类型

```typescript
function createUser(name: string, age: number, ...skills: [string, ...string[]]): User {
  return {
    name,
    age,
    skills: skills.length > 0 ? skills : ["None"]
  };
}
```

### 3. 混合使用可选参数、默认参数和剩余参数

```typescript
function logInfo(
  message: string,
  level: "info" | "warn" | "error" = "info",
  ...tags: string[]
): void {
  console.log(`[${level.toUpperCase()}] ${message}`, tags.length > 0 ? `Tags: ${tags.join(", ")}` : "");
}
```

## 函数重载

### 简单描述

函数重载就像是一个多功能工具，可以根据不同的输入执行不同的操作。想象一把瑞士军刀，它有不同的工具可以应对不同的场景。函数重载允许我们为同一个函数名定义多个不同的参数类型和返回类型组合。

### 实际应用场景

1. API 设计：当一个函数需要处理多种不同类型的输入时，如处理不同格式的日期字符串。
2. 数据处理：在处理复杂数据结构时，如处理单个对象或对象数组。
3. 图形库：绘制不同形状时，如绘制圆形、矩形或多边形。

### 使用后果

优点：
- 提高代码可读性和类型安全性
- 允许更灵活的函数设计
- 改善 IDE 的智能提示和错误检查

缺点：
- 可能增加代码复杂度
- 需要仔细管理重载函数的实现
- 可能导致运行时性能略有下降（因为需要进行类型检查）

### 示例

```typescript
interface StringArray {
  [index: number]: string;
}

interface StringDictionary {
  [key: string]: string;
}

function getElement(n: number): string;
function getElement(s: string): string;
function getElement(arr: StringArray, n: number): string;
function getElement(obj: StringDictionary, s: string): string;
function getElement(a: any, b?: any): string {
  if (typeof a === "number") {
    return `Element at index ${a}`;
  } else if (typeof a === "string") {
    return `Element with key ${a}`;
  } else if (Array.isArray(a) && typeof b === "number") {
    return a[b];
  } else if (typeof a === "object" && typeof b === "string") {
    return a[b];
  }
  throw new Error("Invalid arguments");
}
```

这个例子展示了如何使用函数重载来处理不同类型的输入，包括数字索引、字符串键、数组和对象。这种方法可以在处理复杂数据结构时提供更好的类型安全性和代码可读性。