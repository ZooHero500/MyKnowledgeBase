# 组合式函数

组合式函数是 Vue 3 中实现代码复用的主要方式，它通过组合不同的功能函数来实现复杂的业务逻辑。

## 核心概念

### 什么是组合式函数？

组合式函数是一个利用 Vue 的组合式 API 来封装和复用**有状态逻辑**的函数。

主要特点：
- 以 `use` 作为函数名称前缀
- 可以访问组件的生命周期
- 可以创建响应式状态
- 遵循组合式 API 的规范

## 最佳实践

### 1. 状态管理

```ts
// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    double,
    increment,
    decrement
  }
}

// 使用
const {
  count,
  double,
  increment,
  decrement
} = useCounter(10)
```

### 2. 异步状态管理

```ts
// useAsync.ts
import { ref } from 'vue'

export function useAsync<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    execute
  }
}

// 使用
const {
  data,
  error,
  loading,
  execute
} = useAsync(async () => {
  const res = await fetch('/api/data')
  return res.json()
})
```

### 3. 生命周期集成

```ts
// useEventListener.ts
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(
  target: Window | HTMLElement,
  event: string,
  callback: (e: Event) => void
) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}

// 使用
useEventListener(window, 'resize', () => {
  console.log('window resized')
})
```

## 进阶技巧

### 1. 组合多个组合式函数

```ts
// useTodos.ts
import { ref } from 'vue'
import { useAsync } from './useAsync'
import { useLocalStorage } from './useLocalStorage'

export function useTodos() {
  // 复用异步状态管理
  const { data, loading, execute: fetchTodos } = useAsync(async () => {
    const res = await fetch('/api/todos')
    return res.json()
  })

  // 复用本地存储
  const { value: filter, setValue: setFilter } = useLocalStorage(
    'todo-filter',
    'all'
  )

  // 组合新的业务逻辑
  const displayTodos = computed(() => {
    if (!data.value) return []
    
    switch (filter.value) {
      case 'completed':
        return data.value.filter(todo => todo.completed)
      case 'active':
        return data.value.filter(todo => !todo.completed)
      default:
        return data.value
    }
  })

  return {
    todos: displayTodos,
    loading,
    filter,
    setFilter,
    fetchTodos
  }
}
```

### 2. 副作用清理

```ts
// useInterval.ts
import { ref, onUnmounted } from 'vue'

export function useInterval(callback: () => void, delay: number) {
  const intervalId = ref<number>()

  function clear() {
    if (intervalId.value) {
      clearInterval(intervalId.value)
    }
  }

  // 自动清理
  onUnmounted(clear)

  intervalId.value = setInterval(callback, delay)

  return clear
}

// 使用
const clear = useInterval(() => {
  console.log('tick')
}, 1000)

// 手动清理
clear()
```

### 3. 类型安全

```ts
// useForm.ts
interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
}

export function useForm<T extends object>(initialValues: T) {
  const state = reactive<FormState<T>>({
    values: { ...initialValues },
    errors: {},
    touched: {}
  })

  function setFieldValue<K extends keyof T>(
    field: K,
    value: T[K]
  ) {
    state.values[field] = value
    state.touched[field] = true
  }

  return {
    ...toRefs(state),
    setFieldValue
  }
}

// 使用
interface LoginForm {
  username: string
  password: string
}

const { values, errors, setFieldValue } = useForm<LoginForm>({
  username: '',
  password: ''
})
```

## 最佳实践

### 1. 命名规范
- 使用 `use` 前缀
- 使用驼峰命名
- 名称应该表明功能而不是实现

```ts
// ✅ 好的命名
useUserAuth()
useWindowSize()
useAsyncData()

// ❌ 不好的命名
useHandleAuth()
useSetupWindowSize()
useData()
```

### 2. 返回值结构
- 返回一个包含多个值的对象而不是数组
- 使用解构来获取需要的值
- 考虑返回 `readonly` 的值来防止外部修改

```ts
// ✅ 好的方式
export function useCounter() {
  const count = ref(0)
  
  return {
    count: readonly(count),
    increment: () => count.value++,
    decrement: () => count.value--
  }
}

// ❌ 不好的方式
export function useCounter() {
  const count = ref(0)
  return [count, () => count.value++, () => count.value--]
}
```

### 3. 错误处理
- 提供清晰的错误信息
- 使用 TypeScript 类型系统来防止错误
- 考虑提供默认值和降级方案

```ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 提供错误处理
  const read = (): T => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e)
      return initialValue
    }
  }

  const data = ref<T>(read())

  const write = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      data.value = value
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e)
    }
  }

  return {
    data: readonly(data),
    write
  }
}
```

## 调试技巧

### 1. 开发环境检查

```ts
export function useDevCheck(composableName: string) {
  if (import.meta.env.DEV) {
    const stack = new Error().stack
    console.log(`${composableName} was called from:`, stack)
  }
}

// 在组合式函数中使用
export function useMyFeature() {
  useDevCheck('useMyFeature')
  // ...
}
```

### 2. 性能追踪

```ts
export function usePerformanceTrack(name: string) {
  if (import.meta.env.DEV) {
    const start = performance.now()
    
    onUnmounted(() => {
      const end = performance.now()
      console.log(`${name} was active for ${end - start}ms`)
    })
  }
}

// 在组合式函数中使用
export function useExpensiveFeature() {
  usePerformanceTrack('useExpensiveFeature')
  // ...
}
```
