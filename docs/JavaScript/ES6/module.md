# JavaScript 模块系统

ES6 模块系统为 JavaScript 提供了官方的模块化解决方案，支持导入和导出功能。

## 基本语法

### 导出语法

```javascript
// 命名导出
export const name = 'John';
export function sayHello() {
    console.log('Hello');
}

// 默认导出
export default class User {
    constructor(name) {
        this.name = name;
    }
}

// 批量导出
const age = 25;
const gender = 'male';
export { age, gender };

// 重命名导出
export { age as userAge, gender as userGender };
```

### 导入语法

```javascript
// 导入默认导出
import User from './user.js';

// 导入命名导出
import { name, sayHello } from './utils.js';

// 导入全部并重命名
import * as Utils from './utils.js';

// 重命名导入
import { age as userAge } from './user.js';

// 混合导入
import User, { name, age } from './user.js';
```

## 模块特性

### 静态分析

```javascript
// 错误示例：条件导入
if (condition) {
    import module from './module.js'; // 语法错误
}

// 正确示例：动态导入
if (condition) {
    import('./module.js').then(module => {
        // 使用模块
    });
}
```

### 严格模式

```javascript
// 模块自动运行在严格模式下
name = 'John';        // 错误：未声明变量
delete Object.prototype; // 错误：不可删除
```

### 单例模式

```javascript
// module.js
export let counter = 0;
export function increment() {
    counter++;
}

// main.js
import { counter, increment } from './module.js';
import { counter as count } from './module.js';

increment();
console.log(counter); // 1
console.log(count);   // 1 (同一个实例)
```

## 动态导入

### import() 函数

```javascript
// 基本用法
const loadModule = async () => {
    const module = await import('./module.js');
    module.default(); // 使用默认导出
    module.namedExport(); // 使用命名导出
};

// 条件加载
const condition = true;
if (condition) {
    import('./module.js')
        .then(module => {
            // 使用模块
        })
        .catch(error => {
            // 处理错误
        });
}
```

### 动态导入应用场景

```javascript
// 路由懒加载
const routes = {
    home: () => import('./pages/home.js'),
    about: () => import('./pages/about.js'),
    contact: () => import('./pages/contact.js')
};

// 按需加载
button.addEventListener('click', async () => {
    const { default: Modal } = await import('./components/Modal.js');
    new Modal().show();
});
```

## 模块打包工具

### Webpack 配置

```javascript
// webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};
```

### Rollup 配置

```javascript
// rollup.config.js
export default {
    input: 'src/index.js',
    output: {
        file: 'bundle.js',
        format: 'esm'
    }
};
```

## 最佳实践

### 目录结构

```
src/
├── components/
│   ├── index.js
│   └── Component.js
├── utils/
│   ├── index.js
│   └── helpers.js
└── index.js
```

### 导入导出规范

```javascript
// 推荐：使用 index.js 统一导出
// components/index.js
export { default as Button } from './Button';
export { default as Input } from './Input';

// 使用时
import { Button, Input } from './components';
```

### 性能优化

1. **代码分割**
   ```javascript
   // 路由级别的代码分割
   const routes = [
       {
           path: '/dashboard',
           component: () => import('./views/Dashboard.js')
       }
   ];
   ```

2. **预加载**
   ```javascript
   // 用户悬停时预加载
   element.addEventListener('mouseenter', () => {
       const module = import('./heavy-module.js');
   });
   ```

### 常见问题

1. **循环依赖**
   ```javascript
   // a.js
   import { b } from './b.js';
   export const a = 1;

   // b.js
   import { a } from './a.js';
   export const b = a + 1; // 可能出现未定义错误
   ```

2. **命名冲突**
   ```javascript
   // 使用命名空间避免冲突
   import * as UserAPI from './api/user.js';
   import * as ProductAPI from './api/product.js';
   ```

## 浏览器支持

### 使用方式

```html
<!-- 使用 type="module" -->
<script type="module">
    import { feature } from './module.js';
</script>

<!-- 提供降级方案 -->
<script type="module" src="app.js"></script>
<script nomodule src="app-legacy.js"></script>
```

### 跨域限制

```html
<!-- 需要正确的 CORS 头 -->
<script type="module" src="https://example.com/module.js"></script>
