# Webpack vs Vite

## 开发模式对比

```mermaid
graph TB
    subgraph Webpack
        A1[源代码] --> B1[构建依赖图]
        B1 --> C1[打包所有模块]
        C1 --> D1[提供打包结果]
    end
    
    subgraph Vite
        A2[源代码] --> B2[预构建依赖]
        B2 --> C2[按需编译]
        C2 --> D2[原生ESM]
    end
```

## 主要区别

### 1. 开发服务器
- Webpack: 先打包再启动，冷启动慢
- Vite: 按需编译，秒级启动

### 2. 热更新
- Webpack: 重新构建模块依赖
- Vite: 精确定位，速度快

### 3. 构建工具
- Webpack: 自带构建能力
- Vite: 开发用 esbuild，生产用 Rollup

### 4. 生态
- Webpack: 成熟稳定，插件丰富
- Vite: 新兴但发展快，基础插件齐全

## 如何选择

- 选 Webpack：
  - 需要支持低版本浏览器
  - 项目依赖复杂，需要高度定制
  - 团队已有相关经验

- 选 Vite：
  - 开发体验优先
  - 项目以 ES 模块为主
  - 团队愿意尝试新技术