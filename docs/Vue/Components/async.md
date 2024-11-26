# 异步组件 (Async Components)

异步组件是 Vue 中实现代码分割和按需加载的重要机制，它允许将应用分割成更小的代码块，并仅在需要时才加载。

## 基础知识

### 异步组件的本质
异步组件解决了以下问题：
- 减小应用的初始包体积
- 实现按需加载
- 提高首屏加载性能
- 优化资源加载策略

### 基本语法

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 带选项的用法
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./components/AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncComp />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

## 最佳实践

### 1. 合理的分割点
选择合适的代码分割点：

```vue
<script setup>
// ✅ 好的分割点
const UserDashboard = defineAsyncComponent(() =>
  import('./features/UserDashboard.vue')
)

const AdminPanel = defineAsyncComponent(() =>
  import('./features/AdminPanel.vue')
)

// ❌ 过度分割
const Button = defineAsyncComponent(() =>
  import('./components/Button.vue')
)
</script>
```

### 2. 预加载策略
实现智能的预加载策略：

```vue
<script setup>
// 路由组件预加载
const UserProfile = defineAsyncComponent(() => {
  const loader = () => import('./UserProfile.vue')
  
  // 当用户悬停在链接上时预加载
  onMouseover: () => {
    loader()
  }
  
  return loader
})

// 视口预加载
const LazyComponent = defineAsyncComponent(() => {
  let loadPromise = null
  
  const load = () => {
    if (!loadPromise) {
      loadPromise = import('./LazyComponent.vue')
    }
    return loadPromise
  }
  
  // 当组件进入视口时预加载
  useIntersectionObserver(elementRef, ([entry]) => {
    if (entry.isIntersecting) {
      load()
    }
  })
  
  return load
})
</script>
```

### 3. 错误处理
实现完善的错误处理：

```vue
<script setup>
const AsyncComp = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  // 展示加载组件前的延迟时间
  delay: 200,
  // 超时时间
  timeout: 3000,
  // 错误重试
  onError(error, retry, fail, attempts) {
    if (error.message.includes('fetch') && attempts <= 3) {
      // 网络错误时重试
      retry()
    } else {
      // 其他错误直接失败
      fail()
    }
  }
})
</script>
```

## 高级技巧

### 1. 动态导入表达式
使用动态导入路径：

```vue
<script setup>
const getAsyncComponent = (componentName) => {
  return defineAsyncComponent(() =>
    import(`./components/${componentName}.vue`)
      .catch(() => import('./components/NotFound.vue'))
  )
}

// 使用
const DynamicComponent = computed(() => 
  getAsyncComponent(props.componentName)
)
</script>
```

### 2. 组件库按需加载
实现组件库的按需加载：

```vue
<script>
// 组件注册工厂
const asyncComponentFactory = (name) => {
  return defineAsyncComponent({
    loader: () => import(`./components/${name}`),
    delay: 0,
    timeout: 5000
  })
}

// 组件注册函数
export const registerComponent = (app, name) => {
  app.component(name, asyncComponentFactory(name))
}

// 批量注册
export const registerComponents = (app, components) => {
  components.forEach(name => registerComponent(app, name))
}
</script>
```

### 3. 缓存策略
实现组件加载缓存：

```vue
<script setup>
const componentCache = new Map()

const loadComponent = (name) => {
  if (!componentCache.has(name)) {
    componentCache.set(
      name,
      defineAsyncComponent(() => import(`./components/${name}.vue`))
    )
  }
  return componentCache.get(name)
}

// 使用
const MyComponent = loadComponent('MyComponent')
</script>
```

## 性能优化

### 1. 加载优先级
实现加载优先级控制：

```vue
<script setup>
// 高优先级组件 - 立即加载
const HighPriorityComponent = defineAsyncComponent({
  loader: () => import('./HighPriority.vue'),
  delay: 0
})

// 低优先级组件 - 延迟加载
const LowPriorityComponent = defineAsyncComponent({
  loader: () => new Promise(resolve => {
    // 使用 requestIdleCallback 在空闲时加载
    window.requestIdleCallback(() => {
      resolve(import('./LowPriority.vue'))
    })
  }),
  delay: 200
})
</script>
```

### 2. 预加载组
实现组件组预加载：

```vue
<script setup>
const preloadGroup = (components) => {
  const preloadPromises = components.map(component => {
    return () => import(`./components/${component}.vue`)
  })
  
  return Promise.all(preloadPromises)
}

// 使用
onMounted(() => {
  // 在适当的时机预加载一组相关组件
  preloadGroup(['Chart', 'Table', 'Filter'])
})
</script>
```

## 调试技巧

### 1. 加载状态追踪
追踪组件加载状态：

```vue
<script setup>
const AsyncComp = defineAsyncComponent({
  loader: () => {
    if (import.meta.env.DEV) {
      console.time('Component Load')
    }
    
    return import('./AsyncComponent.vue')
      .then(comp => {
        if (import.meta.env.DEV) {
          console.timeEnd('Component Load')
        }
        return comp
      })
  }
})
</script>
```

### 2. 错误边界处理
实现错误边界和降级策略：

```vue
<script setup>
const AsyncComp = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  onError(error, retry, fail, attempts) {
    if (import.meta.env.DEV) {
      console.error(`
        Error loading component:
        Message: ${error.message}
        Attempt: ${attempts}
      `)
    }
    
    if (attempts <= 3) {
      // 重试逻辑
      setTimeout(() => {
        retry()
      }, 1000 * attempts)
    } else {
      // 降级到同步组件
      return import('./FallbackComponent.vue')
    }
  }
})
</script>
```

### 3. 性能监控
添加性能监控：

```vue
<script setup>
const createAsyncComponent = (path, options = {}) => {
  return defineAsyncComponent({
    loader: () => {
      const start = performance.now()
      
      return import(path).then(comp => {
        if (import.meta.env.DEV) {
          const duration = performance.now() - start
          console.log(`Component ${path} loaded in ${duration}ms`)
        }
        return comp
      })
    },
    ...options
  })
}

// 使用
const MonitoredComponent = createAsyncComponent(
  './components/Heavy.vue',
  {
    delay: 200,
    timeout: 5000
  }
)
</script>
```
