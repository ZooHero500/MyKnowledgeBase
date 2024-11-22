# 模块和命名空间

## 简介

模块提供了一种封装代码的方式，而命名空间则是一种在全局作用域内组织代码的方法。

## 模块

模块是 TypeScript 中组织和封装代码的主要方式。每个文件可以被视为一个模块，可以导出和导入变量、函数、类等。

### 模块的导出

有多种方式可以导出模块内容：

```typescript
// 命名导出
export const PI = 3.14159
export function calculateCircumference(radius: number): number {
  return 2 * PI * radius
}

// 默认导出
export default class Circle {
  constructor(public radius: number) {}
  area(): number {
    return PI * this.radius ** 2
  }
}

// 重命名导出
const _internalPI = 3.14159
export { _internalPI as PI }
```

### 模块的导入

相应地，有多种方式可以导入模块内容：

```typescript
// 导入命名导出
import { PI, calculateCircumference } from './math'

// 导入默认导出
import Circle from './circle'

// 导入全部并重命名
import * as MathUtils from './math'

// 重命名导入
import { PI as CirclePI } from './math'
```

## 命名空间

命名空间是 TypeScript 特有的特性，用于在全局作用域内组织代码，避免命名冲突。

```typescript
namespace Geometry {
  export interface Point {
    x: number
    y: number
  }

  export class Line {
    constructor(public start: Point, public end: Point) {}
    length(): number {
      const dx = this.end.x - this.start.x
      const dy = this.end.y - this.start.y
      return Math.sqrt(dx * dx + dy * dy)
    }
  }
}

// 使用命名空间
let point: Geometry.Point = { x: 0, y: 0 }
let line = new Geometry.Line(point, { x: 3, y: 4 })
console.log(line.length()) // 输出: 5
```

### 命名空间可以通过以下方式引入和使用：

1. 在同一文件中使用：
   直接使用命名空间名称加上点号访问其中的成员。

   ```typescript
   namespace Geometry {
       export interface Point { x: number; y: number; }
   }

   let point: Geometry.Point = { x: 0, y: 0 };
   ```

2. 跨文件使用：
   a. 在定义命名空间的文件中，使用 `namespace` 关键字定义命名空间。
   b. 在使用的文件中，使用 `/// <reference path="..." />` 指令引入命名空间文件。

   // geometry.ts
   ```typescript
   namespace Geometry {
       export interface Point { x: number; y: number; }
   }
   ```

   // main.ts
   ```typescript
   /// <reference path="geometry.ts" />
   
   let point: Geometry.Point = { x: 0, y: 0 };
   ```

3. 使用 `import` 别名：
   可以使用 `import` 给命名空间创建一个别名，简化使用。

   ```typescript
   namespace Shapes {
       export namespace Polygons {
           export class Triangle { /* ... */ }
           export class Square { /* ... */ }
       }
   }

   import polygons = Shapes.Polygons;
   let sq = new polygons.Square(); // 等同于 new Shapes.Polygons.Square()
   ```

## 模块解析策略

模块解析是指编译器如何确定导入的内容指向哪个文件。TypeScript 有两种解析策略：Classic 和 Node。

### 1. Classic 策略

这是 TypeScript 最初的默认策略，主要用于向后兼容。

- 相对导入（以 `/`、`./` 或 `../` 开头）：从导入文件所在目录开始查找。
- 非相对导入：从包含导入文件的目录开始，逐级向上级目录查找。

例如，对于 `import { a } from "moduleA"`：
1. `/root/src/moduleA.ts`
2. `/root/src/moduleA.d.ts`
3. `/root/moduleA.ts`
4. `/root/moduleA.d.ts`
5. `/moduleA.ts`
6. `/moduleA.d.ts`

### 2. Node 策略

这种策略模仿 Node.js 的模块解析机制，是现在推荐使用的策略。

- 相对导入：与 Classic 策略类似。
- 非相对导入：
  1. 查找 `package.json` 文件中的 `"types"` 字段。
  2. 查找 `index.d.ts` 文件。
  3. 查找 `package.json` 文件中的 `"main"` 字段指定的文件。
  4. 查找 `index.js` 文件。

例如，对于 `import { a } from "moduleA"`，假设当前文件在 `/root/src/module.ts`：
1. `/root/src/node_modules/moduleA.ts`
2. `/root/src/node_modules/moduleA.tsx`
3. `/root/src/node_modules/moduleA.d.ts`
4. `/root/src/node_modules/moduleA/package.json` (如果指定了 `"types"` 属性)
5. `/root/src/node_modules/moduleA/index.ts`
6. `/root/src/node_modules/moduleA/index.tsx`
7. `/root/src/node_modules/moduleA/index.d.ts`
8. 然后在上级目录 `/root/node_modules` 中重复步骤 1-7
9. 再在 `/node_modules` 中重复步骤 1-7

### 配置模块解析策略

在 `tsconfig.json` 中可以配置模块解析策略：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",  // 或 "classic"
    "baseUrl": "./",  // 基本目录，用于解析非相对模块名
    "paths": {  // 路径映射，用于模块名到相对于 baseUrl 的路径映射
      "jquery": ["node_modules/jquery/dist/jquery"]
    }
  }
}
```