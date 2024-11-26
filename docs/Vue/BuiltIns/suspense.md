# Suspense 异步组件

`Suspense` 是 Vue 3 提供的一个内置组件，用于协调对异步依赖的处理。它可以在等待异步组件或异步数据加载时显示加载状态，并在加载完成后无缝切换到实际内容。

## 1. 基础用法

### 1.1 基本示例

```vue
<template>
  <Suspense>
    <!-- 默认插槽：异步内容 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- fallback 插槽：加载状态 -->
    <template #fallback>
      <div class="loading">Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
// 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>
```

### 1.2 异步 Setup

Suspense 也支持 setup 函数中的异步操作：

```vue
<!-- AsyncSetup.vue -->
<script setup>
const data = await fetchData() // 直接使用顶层 await
</script>

<template>
  <div>{{ data }}</div>
</template>
```

## 2. 高级用法

### 2.1 嵌套异步依赖

Suspense 可以处理多层嵌套的异步依赖：

```vue
<template>
  <Suspense>
    <template #default>
      <div>
        <AsyncParent>
          <AsyncChild />
        </AsyncParent>
      </div>
    </template>
    
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncParent = defineAsyncComponent(() =>
  import('./AsyncParent.vue')
)

const AsyncChild = defineAsyncComponent(() =>
  import('./AsyncChild.vue')
)
</script>
```

### 2.2 错误处理

使用 `onErrorCaptured` 处理异步操作中的错误：

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((e) => {
  error.value = e
  return false // 阻止错误继续传播
})
</script>

<template>
  <div v-if="error">
    出错了：{{ error }}
  </div>
  <Suspense v-else>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingComponent />
    </template>
  </Suspense>
</template>
```

## 3. 实际应用场景

### 3.1 数据加载页面

创建一个带有加载状态的数据展示页面：

```vue
<!-- DataPage.vue -->
<script setup>
import { ref } from 'vue'

// 模拟异步数据获取
const fetchUserData = async () => {
  const response = await fetch('https://api.example.com/users')
  return response.json()
}

const userData = await fetchUserData() // 直接使用顶层 await
</script>

<template>
  <div class="user-list">
    <div v-for="user in userData" :key="user.id" class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>
```

使用这个组件：

```vue
<!-- App.vue -->
<template>
  <Suspense>
    <template #default>
      <DataPage />
    </template>
    
    <template #fallback>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </template>
  </Suspense>
</template>

<style>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

### 3.2 路由组件

在路由切换时使用 Suspense：

```vue
<!-- router.js -->
import { createRouter } from 'vue-router'

const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      component: () => import('./views/Dashboard.vue')
    }
  ]
})
```

```vue
<!-- App.vue -->
<template>
  <Suspense>
    <template #default>
      <RouterView />
    </template>
    
    <template #fallback>
      <PageLoadingIndicator />
    </template>
  </Suspense>
</template>
```

### 3.3 组件库异步加载

创建一个按需加载的组件库：

```vue
<!-- AsyncUI.vue -->
<script setup>
import { defineAsyncComponent } from 'vue'

const Chart = defineAsyncComponent(() =>
  import('heavy-chart-library')
)

const Table = defineAsyncComponent(() =>
  import('heavy-table-component')
)

// 组件的 props
const props = defineProps({
  type: String,
  data: Object
})
</script>

<template>
  <Suspense>
    <template #default>
      <component
        :is="type === 'chart' ? Chart : Table"
        :data="data"
      />
    </template>
    
    <template #fallback>
      <div class="component-loading">
        <LoadingPlaceholder :type="type" />
      </div>
    </template>
  </Suspense>
</template>
```

## 4. 性能优化

### 4.1 延迟加载策略

实现智能的延迟加载：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  delay: 200, // 200ms 延迟显示加载状态
  timeout: 3000, // 3s 超时
})
</script>
```

### 4.2 缓存控制

使用 `KeepAlive` 配合 Suspense：

```vue
<template>
  <KeepAlive>
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <LoadingState />
      </template>
    </Suspense>
  </KeepAlive>
</template>
```

## 5. 调试技巧

### 5.1 使用 Vue DevTools

Vue DevTools 可以帮助你：
- 观察异步组件的加载状态
- 检查 Suspense 树的结构
- 调试异步加载问题

### 5.2 常见问题排查

1. 加载状态闪烁：
   ```js
   // 添加最小延迟时间
   const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
   
   const fetchData = async () => {
     const [data] = await Promise.all([
       fetch('/api/data'),
       delay(300) // 最小显示时间
     ])
     return data.json()
   }
   ```

2. 错误处理：
   ```vue
   <script setup>
   import { onErrorCaptured, ref } from 'vue'
   
   const error = ref(null)
   const retry = ref(0)
   
   onErrorCaptured((e) => {
     error.value = e
     // 自动重试
     if (retry.value < 3) {
       retry.value++
       return false
     }
   })
   </script>
   ```

## 6. 最佳实践

1. **加载状态设计**
```vue
<template>
  <Suspense>
    <template #fallback>
      <SkeletonLoader :type="contentType" />
    </template>
  </Suspense>
</template>
```

2. **错误边界**
```vue
<script setup>
const handleError = (error) => {
  // 错误上报
  reportError(error)
  // 显示用户友好的错误信息
  showErrorMessage()
}
</script>
```

3. **超时处理**
```js
const AsyncComponent = defineAsyncComponent({
  timeout: 5000,
  errorComponent: TimeoutError
})
```

4. **并发控制**
```vue
<script setup>
const loadData = async () => {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts()
  ])
  return { users, posts }
}
</script>
```

5. **优雅降级**
```vue
<template>
  <Suspense>
    <template #default>
      <AsyncFeature />
    </template>
    <template #fallback>
      <SimplifiedVersion />
    </template>
  </Suspense>
</template>
```
