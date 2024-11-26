# Vue 工程化实践

Vue 项目的工程化实践涉及项目的整个生命周期，从初始化到开发、测试、构建、部署等各个环节。本文将详细介绍 Vue 项目中的工程化最佳实践。

## 项目初始化

### 脚手架选择

1. **create-vue**
```bash
npm create vue@latest
```
- 基于 Vite 的官方脚手架
- 支持 TypeScript、JSX、路由、Pinia 等
- 更快的开发服务器和构建速度

2. **Vue CLI**
```bash
npm install -g @vue/cli
vue create my-project
```
- 基于 webpack 的传统脚手架
- 丰富的插件生态
- 完善的项目模板

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── composables/     # 组合式函数
├── layouts/         # 布局组件
├── pages/          # 页面组件
├── router/         # 路由配置
├── stores/         # 状态管理
├── styles/         # 全局样式
├── types/          # TypeScript 类型
└── utils/          # 工具函数
```

## 代码规范

### ESLint 配置
```js
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'error',
    'vue/no-unused-components': 'error',
    'vue/no-unused-vars': 'error'
  }
}
```

### Prettier 配置
```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 80,
  "trailingComma": "none",
  "arrowParens": "avoid"
}
```

### Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 构建优化

### Vite 配置
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer()
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus']
        }
      }
    }
  }
})
```

### 性能优化

1. **代码分割**
```js
// 路由级别的代码分割
const routes = [
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
]
```

2. **资源预加载**
```html
<link rel="modulepreload" href="/src/assets/large-module.js">
```

3. **图片优化**
```vue
<template>
  <img
    loading="lazy"
    srcset="/img/hero-400w.jpg 400w,
            /img/hero-800w.jpg 800w"
    sizes="(max-width: 400px) 400px,
           800px"
    src="/img/hero-800w.jpg"
    alt="Hero image"
  >
</template>
```

## 自动化部署

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 监控与日志

### 性能监控
```js
// 使用 Web Vitals 监控性能指标
import { onCLS, onFID, onLCP } from 'web-vitals'

function sendToAnalytics({ name, delta, id }) {
  // 发送到分析服务
  console.log(`Metric: ${name} ID: ${id} Value: ${delta}`)
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
```

### 错误监控
```js
// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  // 发送到错误追踪服务
  reportError(err, info)
}

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  // 发送到错误追踪服务
  reportError(error)
})
```

## 微前端实践

### 基于 qiankun 的实现
```js
// 主应用
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue app',
    entry: '//localhost:8080',
    container: '#container',
    activeRule: '/vue'
  }
])

start()

// 子应用
const app = createApp(App)
let instance = null

function render(props = {}) {
  instance = app.mount(
    props.container 
      ? props.container.querySelector('#app') 
      : '#app'
  )
}

export async function bootstrap() {
  console.log('vue app bootstraped')
}

export async function mount(props) {
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
```

## 组件库开发

### 组件封装
```vue
// components/Button/Button.vue
<template>
  <button
    :class="[
      'btn',
      `btn--${type}`,
      { 'btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'secondary'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>
```

### 文档生成
```js
// vitepress.config.js
export default {
  title: 'Component Library',
  description: 'Vue Component Library',
  themeConfig: {
    sidebar: [
      {
        text: 'Components',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Input', link: '/components/input' }
        ]
      }
    ]
  }
}
```

## 持续集成

### 单元测试集成
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### 代码质量检查
```yaml
name: Code Quality
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
```
