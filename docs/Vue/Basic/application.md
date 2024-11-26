# 创建 Vue 应用

## 快速开始

### 使用 CDN
最简单的使用 Vue 的方式是通过 CDN：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp } = Vue
  
  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```

### 使用构建工具

1. **使用 Vite 创建项目**
```bash
npm create vite@latest my-vue-app -- --template vue
cd my-vue-app
npm install
npm run dev
```

2. **项目结构**
```
my-vue-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

## 应用实例

### 创建应用实例

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

### 应用配置

```js
// 全局配置
app.config.errorHandler = (err) => {
  /* 处理错误 */
}

// 全局属性
app.config.globalProperties.$http = axios

// 全局指令
app.directive('focus', {
  mounted: (el) => el.focus()
})
```

### 多个应用实例

```js
const app1 = createApp({
  /* ... */
})
app1.mount('#app-1')

const app2 = createApp({
  /* ... */
})
app2.mount('#app-2')
```

## 应用组件

### 注册全局组件

```js
app.component('my-component', {
  template: `<div>全局组件</div>`
})
```

### 使用插件

```js
import { createApp } from 'vue'
import { createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const router = createRouter(/* ... */)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')
```

## 开发环境配置

### Vite 配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})
```

### 环境变量

```
.env                # 所有环境
.env.local         # 所有环境，但被 git 忽略
.env.development   # 开发环境
.env.production    # 生产环境
```

使用环境变量：
```js
console.log(import.meta.env.VITE_API_URL)
```

## 最佳实践

1. **应用结构**
   - 保持入口文件简洁
   - 模块化配置
   - 合理使用插件

2. **性能优化**
   - 按需导入组件
   - 路由懒加载
   - 合理使用异步组件

3. **开发规范**
   - 使用 TypeScript
   - 使用 ESLint 和 Prettier
   - 遵循 Vue 风格指南

## 常见问题

### 1. 应用无法挂载
- 检查挂载点是否存在
- 检查 Vue 实例是否正确创建
- 检查控制台错误信息

### 2. 开发环境配置问题
- 检查 Node.js 版本
- 检查依赖版本
- 清除缓存重新安装依赖

### 3. 生产环境部署
- 确保构建配置正确
- 检查环境变量设置
- 验证静态资源路径
