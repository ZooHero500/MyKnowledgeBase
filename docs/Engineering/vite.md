# Vite

## 简介

Vite 是新一代的前端构建工具，利用浏览器原生 ES 模块能力和 esbuild 预构建，实现了极快的开发服务器启动和热更新。

## 优缺点

### 优点
- 开发服务器启动快，无需打包
- 热更新速度快且准确
- 开箱即用，配置简单
- 对 TypeScript、JSX、CSS 等有良好支持

### 缺点
- 生产构建仍依赖 Rollup
- 插件生态相对较新
- 仅支持 ES2015+ 浏览器

## 工作原理

```mermaid
flowchart LR
    subgraph 开发环境
        A[浏览器请求模块] --> B[Vite Dev Server]
        B --> C[按需编译]
        C --> D[返回 ES Module]
        D --> E[浏览器解析执行]
    end
```

```mermaid
flowchart TB
    subgraph 生产环境
        F[源代码] --> G[Rollup]
        G --> H[打包优化]
        H --> I[输出产物]
    end
```

## 构建工具选择

```mermaid
graph TB
    subgraph 开发环境-ESBuild优势
        A1[极快的编译速度] --> B1[秒级冷启动]
        C1[增量编译快] --> D1[即时响应]
    end
    
    subgraph 生产环境-Rollup优势
        A2[更成熟的代码分割] --> B2[更小的产物体积]
        C2[更好的兼容性] --> D2[更多的优化选项]
    end
```

### 为什么开发用 ESBuild
- 开发环境需要频繁重新构建，ESBuild 的速度优势明显
- 不需要代码分割等复杂优化
- 浏览器支持 ESM，可以按需加载

### 为什么生产用 Rollup
- 更成熟的代码分割能力
- 生成更小的包体积
- 更好的浏览器兼容性
- 插件生态更丰富

## 核心功能

### 1. 预构建
- 将 CommonJS 转换为 ESM
- 合并多个模块，减少请求
- 缓存结果提升性能

### 2. HMR
- 精确定位变更模块
- 无需重新加载页面
- 保持应用状态

### 3. 常用配置
```js
export default {
  // 开发服务器选项
  server: {
    port: 3000,
    https: false
  },
  // 构建选项
  build: {
    target: 'modules',
    minify: 'esbuild'
  },
  // 依赖优化
  optimizeDeps: {
    include: ['vue']
  }
}
```
