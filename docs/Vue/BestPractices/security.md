# Vue 安全最佳实践

本文将介绍 Vue 应用开发中的安全最佳实践，包括常见的安全问题及其解决方案。

## 1. XSS 防护

### 1.1 模板 XSS 防护

Vue 默认会对模板中的内容进行转义，但在某些情况下需要特别注意：

```vue
<template>
  <!-- 安全：自动转义 -->
  <div>{{ userInput }}</div>
  
  <!-- 危险：v-html 会直接插入 HTML -->
  <div v-html="userInput"></div>
  
  <!-- 安全：使用 v-bind 绑定属性 -->
  <img :src="userProvidedUrl">
</template>

<script setup>
import { ref } from 'vue'
import DOMPurify from 'dompurify'

const userInput = ref('<script>alert("xss")</script>')

// 如果必须使用 v-html，请先净化内容
const sanitizedHtml = computed(() => DOMPurify.sanitize(userInput.value))
</script>
```

### 1.2 URL XSS 防护

处理用户提供的 URL：

```js
// url-sanitizer.js
export function sanitizeUrl(url) {
  // 只允许 http:// 和 https:// 协议
  if (!/^https?:\/\//i.test(url)) {
    return ''
  }
  
  try {
    const parsedUrl = new URL(url)
    // 检查是否是允许的域名
    if (!isAllowedDomain(parsedUrl.hostname)) {
      return ''
    }
    return url
  } catch {
    return ''
  }
}

function isAllowedDomain(hostname) {
  const allowList = [
    'example.com',
    'api.example.com'
  ]
  return allowList.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  )
}
```

### 1.3 CSP 配置

在 HTML 中设置内容安全策略：

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  ">
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

## 2. CSRF 防护

### 2.1 Token 验证

在 API 请求中添加 CSRF token：

```js
// api-client.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// 从 meta 标签获取 CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

// 添加请求拦截器
apiClient.interceptors.request.use(config => {
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }
  return config
})

export default apiClient
```

### 2.2 SameSite Cookie

在后端设置安全的 Cookie 属性：

```js
// 后端示例 (Express)
app.use(session({
  name: 'sessionId',
  secret: 'your-secret-key',
  cookie: {
    secure: true, // 只在 HTTPS 下发送
    httpOnly: true, // 禁止 JavaScript 访问
    sameSite: 'strict', // 严格的同源策略
    maxAge: 3600000 // 1小时过期
  }
}))
```

## 3. 认证和授权

### 3.1 JWT 处理

安全地存储和使用 JWT：

```js
// auth.js
const TOKEN_KEY = 'auth_token'

export const auth = {
  // 存储 token
  setToken(token) {
    // 避免使用 localStorage，使用 httpOnly cookie
    document.cookie = `${TOKEN_KEY}=${token}; path=/; secure; samesite=strict`
  },
  
  // 获取 token
  getToken() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(TOKEN_KEY))
      ?.split('=')[1]
  },
  
  // 清除 token
  clearToken() {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}
```

### 3.2 路由保护

实现路由级别的权限控制：

```js
// router.js
import { createRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  routes: [
    {
      path: '/admin',
      component: AdminDashboard,
      meta: { 
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 重定向到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  if (to.meta.roles && !authStore.hasRole(to.meta.roles)) {
    // 无权限访问
    next({ path: '/403' })
    return
  }
  
  next()
})
```

### 3.3 组件级权限控制

创建权限指令：

```js
// directives/permission.js
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const authStore = useAuthStore()
    
    if (!authStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

使用权限指令：

```vue
<template>
  <button v-permission="'delete:users'">
    删除用户
  </button>
</template>
```

## 4. 敏感数据处理

### 4.1 数据脱敏

创建数据脱敏工具：

```js
// security-utils.js
export const maskData = {
  // 手机号脱敏
  phone(phone) {
    return phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },
  
  // 邮箱脱敏
  email(email) {
    return email?.replace(/(.{3}).+(@.+)/, '$1***$2')
  },
  
  // 身份证脱敏
  idCard(idCard) {
    return idCard?.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  }
}
```

### 4.2 敏感信息存储

安全地处理敏感信息：

```js
// user-store.js
import { defineStore } from 'pinia'
import { encrypt, decrypt } from './crypto'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 不存储敏感信息
    user: null,
    // 使用加密存储必要的敏感信息
    encryptedData: null
  }),
  
  actions: {
    setUserData(userData) {
      // 分离敏感数据
      const { sensitiveInfo, ...publicInfo } = userData
      
      // 存储公开信息
      this.user = publicInfo
      
      // 加密存储敏感信息
      if (sensitiveInfo) {
        this.encryptedData = encrypt(sensitiveInfo)
      }
    },
    
    getSensitiveData() {
      if (!this.encryptedData) return null
      return decrypt(this.encryptedData)
    }
  }
})
```

## 5. 安全配置和最佳实践

### 5.1 安全请求配置

配置安全的 API 请求：

```js
// api-config.js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  // 添加时间戳防止缓存
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    }
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 5.2 错误边界处理

创建错误边界组件：

```vue
<!-- ErrorBoundary.vue -->
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const retry = ref(0)

onErrorCaptured((err, instance, info) => {
  error.value = {
    message: err.message,
    component: instance?.$options.name,
    info
  }
  
  // 记录错误
  logError(error.value)
  
  // 阻止错误继续传播
  return false
})

function resetError() {
  error.value = null
  retry.value++
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <h3>出错了</h3>
    <p>{{ error.message }}</p>
    <button @click="resetError">重试</button>
  </div>
  <slot v-else :key="retry"></slot>
</template>
```

### 5.3 安全检查清单

- 启用了强制的 HTTPS
- 配置了适当的 CSP
- 所有用户输入都经过验证和净化
- 实现了 CSRF 保护
- 使用安全的 cookie 配置
- 实现了适当的认证和授权
- 敏感数据经过加密处理
- 错误信息不暴露敏感信息
- 定期更新依赖包修复安全漏洞
- 实现了速率限制防止暴力攻击
- 使用安全的会话管理
- 实现了日志记录和监控
