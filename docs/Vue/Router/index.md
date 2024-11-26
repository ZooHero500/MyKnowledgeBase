# Vue Router

Vue 的官方路由管理器，用于实现页面导航和 URL 管理。

## 基础配置

### 路由定义

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 注册路由

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 路由导航

### router-link 导航

```vue
<template>
  <nav>
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
  </nav>
  
  <router-view></router-view>
</template>
```

### JS 导航

```js
// 字符串路径
router.push('/about')

// 对象形式
router.push({ path: '/about' })

// 命名路由
router.push({ name: 'About' })

// 带参数
router.push({ path: '/about', query: { plan: 'private' }})
```

## 动态路由

### URL 参数

```js
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]
```

获取参数：
```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.params.id)
</script>
```

### 嵌套路由

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: 'profile',  // /user/:id/profile
        component: UserProfile
      },
      {
        path: 'posts',    // /user/:id/posts
        component: UserPosts
      }
    ]
  }
]
```

## 路由守卫

### 全局守卫

```js
router.beforeEach((to, from) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' }
  }
})
```

### 路由独享守卫

```js
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin()) {
        return { name: 'Home' }
      }
    }
  }
]
```

### 组件内守卫

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开前确认
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges) {
    return confirm('有未保存的更改，确定离开？')
  }
})

// 路由更新（参数变化）
onBeforeRouteUpdate((to, from) => {
  // 如：/users/1 到 /users/2
  loadUserData(to.params.id)
})
</script>
```

## 路由元信息

```js
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  }
]

// 使用
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    const userRoles = getCurrentUserRoles()
    if (!hasRequiredRoles(userRoles, to.meta.roles)) {
      return { name: 'Forbidden' }
    }
  }
})
```

## 滚动行为

```js
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})
```

## 懒加载

```js
const routes = [
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]
