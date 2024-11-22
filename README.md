# Learn Knowledge Base

一个使用 VitePress 构建的个人知识库，用于记录和分享学习笔记、技术文档和最佳实践。

## 特性

- 基于 VitePress 构建的静态站点
- 清晰的文档结构和导航
- 全文搜索功能
- 响应式设计，支持移动端访问
- 快速的页面加载速度

## 目录结构

```
learn-knowledge-base/
├── docs/                 # 文档源文件
│   ├── .vitepress/      # VitePress 配置
│   ├── React/           # React 相关文档
│   ├── TypeScript/      # TypeScript 相关文档
│   └── ...
├── package.json         # 项目依赖
└── README.md           # 项目说明
```

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/learn-knowledge-base.git
cd learn-knowledge-base
```

2. 安装依赖
```bash
npm install
# 或者使用 yarn
yarn install
```

3. 启动开发服务器
```bash
npm run docs:dev
# 或者使用 yarn
yarn docs:dev
```

4. 构建静态文件
```bash
npm run docs:build
# 或者使用 yarn
yarn docs:build
```
