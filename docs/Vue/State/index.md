# Vue 状态管理

## 状态管理方案
1. Pinia（Vue 3）
2. Vuex（Vue 2）
3. 组合式 API

## Pinia

### 基本用法

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  
  // 计算属性
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  // 方法
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      const response = await fetch('...')
      this.data = await response.json()
    }
  }
})
```

### 组件使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()

// 访问状态
console.log(store.count)

// 修改状态
store.count++
// 或用 action
store.increment()

// getter
console.log(store.doubleCount)
</script>

<template>
  <div>
    <p>Count: {{ store.count }}</p>
    <p>Double: {{ store.doubleCount }}</p>
    <button @click="store.increment">+</button>
  </div>
</template>
```

### Setup 风格的 Store

```js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Eduardo')
  
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, name, doubleCount, increment }
})
```

### Store 交互

```js
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userData: null
  }),
  actions: {
    async fetchUserData() {
      const authStore = useAuthStore()
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      this.userData = await response.json()
    }
  }
})
```

## 组合式 API 状态管理

### 共享状态

```js
// stores/user.js
import { ref, computed } from 'vue'

export function useUser() {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    user.value = await response.json()
  }
  
  function logout() {
    user.value = null
  }
  
  return {
    user,
    isLoggedIn,
    login,
    logout
  }
}
```

### 组件使用

```vue
<script setup>
import { useUser } from '@/stores/user'

const { user, isLoggedIn, login, logout } = useUser()
</script>

<template>
  <div v-if="isLoggedIn">
    {{ user.name }}
    <button @click="logout">登出</button>
  </div>
  <div v-else>
    <button @click="login">登录</button>
  </div>
</template>
```

## 最佳实践

### Store 模块化

```
stores/
  ├── index.js     # 导出所有 store
  ├── user.js      # 用户状态
  ├── cart.js      # 购物车状态
  └── products.js  # 商品状态
```

### 持久化

```js
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light'
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    }
  }
})
```

### 状态重置

```js
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    user: null,
    items: []
  }),
  actions: {
    reset() {
      this.$reset()
    },
    async logout() {
      await api.logout()
      this.reset()
    }
  }
})
```

### 状态订阅

```js
const store = useStore()

store.$subscribe((mutation, state) => {
  // 状态变化时触发
  console.log(mutation.type, mutation.payload)
  
  // 持久化
  localStorage.setItem('store', JSON.stringify(state))
})
