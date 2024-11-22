# TypeScript 与 JavaScript 的互操作性

## 1. 声明文件（.d.ts）

声明文件是一种特殊的文件，用于为 JavaScript 代码提供类型信息。它们以 `.d.ts` 为扩展名，不包含实现代码，只包含类型声明。

### 主要用途：

- 为现有的 JavaScript 库提供类型信息
- 在 TypeScript 项目中使用纯 JavaScript 模块
- 描述不是用 TypeScript 编写的代码的形状

### 示例：

```typescript
// 声明文件 example.d.ts
declare function greet(name: string): void;

declare class Person {
  name: string;
  constructor(name: string);
  sayHello(): void;
}

declare namespace MyLibrary {
  function doSomething(): void;
  const version: string;
}
```

## 2. declare 关键字

`declare` 关键字用于告诉 TypeScript 编译器某个变量、函数、类或模块已经在其他地方定义了，通常是在 JavaScript 代码中。

### 主要用途：

- 声明全局变量或函数
- 声明外部模块
- 扩展现有对象或模块的类型定义

### 示例：

```typescript
// 声明全局变量
declare var $: any;

// 声明全局函数
declare function setTimeout(callback: () => void, ms: number): number;

// 声明模块
declare module 'my-module' {
  export function someFunction(): void;
  export const someValue: number;
}
```

## 3. 使用第三方 JavaScript 库

当使用第三方 JavaScript 库时，我们需要为其提供类型定义以便在 TypeScript 中使用。

### 步骤：

1. 安装库本身：
   ```
   npm install library-name
   ```

2. 安装对应的类型定义（如果有）：
   ```
   npm install --save-dev @types/library-name
   ```

3. 如果没有官方的类型定义，可以创建一个自定义的声明文件。

### 示例：使用 lodash

```typescript
// 安装 lodash 和它的类型定义
// npm install lodash
// npm install --save-dev @types/lodash

import _ from 'lodash';

const numbers = [1, 2, 3, 4, 5];
const sum = _.sum(numbers);
console.log(sum); // 输出: 15
```

## 4. 快速创建声明文件的方法

对于大型 JavaScript 项目，手动创建声明文件可能会很繁琐。以下是一些快捷方法：

1. **使用 TypeScript 的自动类型推断**：
   将 `.js` 文件重命名为 `.ts`，TypeScript 会尝试推断类型。

2. **使用 JSDoc 注释**：
   在 JavaScript 文件中使用 JSDoc 注释，TypeScript 可以从中生成类型信息。

   ```javascript
   /**
    * @param {string} name
    * @returns {void}
    */
   function greet(name) {
     console.log(`Hello, ${name}!`);
   }
   ```

3. **使用工具自动生成**：
   - `dts-gen`：可以为 npm 包自动生成 `.d.ts` 文件。
   - `typescript-json-schema`：从 TypeScript 接口生成 JSON schema。

4. **使用 `allowJs` 和 `checkJs` 编译器选项**：
   - `allowJs`：
     - 含义：允许在 TypeScript 项目中导入和使用 JavaScript 文件。
     - 作用：当设置为 `true` 时，TypeScript 编译器将处理 `.js` 文件，就像处理 `.ts` 文件一样。

   - `checkJs`：
     - 含义：对 JavaScript 文件进行类型检查。
     - 作用：当设置为 `true` 时，TypeScript 编译器会对 JavaScript 文件进行类型检查和错误报告。

   这两个选项通常一起使用，以实现对 JavaScript 文件的类型检查和错误报告。例如：

   ```json
   {
     "compilerOptions": {
       "allowJs": true,
       "checkJs": true
     }
   }
   ```

   使用这些选项的好处包括：

   1. 渐进式迁移：逐步将 JavaScript 项目迁移到 TypeScript。
   2. 提高代码质量：利用 TypeScript 的类型检查功能来提高代码质量。
   3. 更好的开发体验：获得更好的代码补全和错误提示。
   4. 与现有 JavaScript 库的兼容性：在 TypeScript 项目中使用现有的 JavaScript 库。
