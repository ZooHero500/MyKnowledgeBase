# 依赖注入 (Provide/Inject)

依赖注入是 Vue 中实现跨层级组件通信的机制，它允许祖先组件向其所有子孙组件注入依赖，而不需要通过 props 层层传递。

## 基础知识

### 依赖注入的本质
依赖注入解决了以下问题：
- 避免 props 逐层传递（prop drilling）
- 实现跨层级的组件通信
- 提供一种松耦合的组件通信方式

### 基本语法

```vue
<!-- 祖先组件 -->
<script setup>
import { provide } from 'vue'

// 提供静态值
provide('message', 'Hello from ancestor!')

// 提供响应式数据
const count = ref(0)
provide('counter', count)

// 提供方法
provide('increment', () => count.value++)
</script>

<!-- 子孙组件 -->
<script setup>
import { inject } from 'vue'

// 注入值
const message = inject('message')
const counter = inject('counter')
const increment = inject('increment')

// 带默认值的注入
const theme = inject('theme', 'light')
</script>
```

## 最佳实践

### 1. 使用 Symbol 作为注入名
使用 Symbol 作为注入的 key，避免命名冲突：

```vue
<!-- constants.js -->
export const INJECTION_KEY = Symbol('injectionKey')

<!-- 提供者组件 -->
<script setup>
import { INJECTION_KEY } from './constants'

provide(INJECTION_KEY, {
  data: ref(0),
  methods: {
    update(val) {
      data.value = val
    }
  }
})
</script>

<!-- 注入组件 -->
<script setup>
import { INJECTION_KEY } from './constants'

const injected = inject(INJECTION_KEY)
</script>
```

### 2. 只读数据
确保注入的数据不被子组件修改：

```vue
<script setup>
import { readonly } from 'vue'

const count = ref(0)
// 提供只读版本
provide('readonly-count', readonly(count))

// 提供更新方法
provide('update-count', (val) => {
  count.value = val
})
</script>
```

### 3. 类型安全的注入
使用 TypeScript 实现类型安全的依赖注入：

```vue
<script setup lang="ts">
interface InjectionType {
  count: Ref<number>
  increment: () => void
}

// 定义注入类型
provide<InjectionType>('key', {
  count: ref(0),
  increment: () => count.value++
})

// 使用类型断言
const {
  count,
  increment
} = inject<InjectionType>('key')!
</script>
```

## 高级技巧

### 1. 响应式注入
实现响应式的依赖注入：

```vue
<script setup>
import { computed } from 'vue'

const state = reactive({
  user: {
    name: 'John',
    age: 30
  }
})

// 提供响应式数据
provide('user', toRef(state, 'user'))

// 提供计算属性
provide('userAge', computed(() => state.user.age))

// 提供更新方法
provide('updateUser', (newUser) => {
  Object.assign(state.user, newUser)
})
</script>
```

### 2. 组合式注入
将多个相关的注入组合在一起：

```vue
<script setup>
// 创建组合式的注入
const createInjection = () => {
  const state = reactive({
    count: 0,
    message: ''
  })

  const increment = () => state.count++
  const updateMessage = (msg) => state.message = msg

  provide('composedInjection', {
    state: readonly(state),
    increment,
    updateMessage
  })
}

// 使用组合式注入
const useInjection = () => {
  return inject('composedInjection', {
    state: { count: 0, message: '' },
    increment: () => {},
    updateMessage: () => {}
  })
}
</script>
```

### 3. 动态注入
实现动态的依赖注入：

```vue
<script setup>
const dynamicProvide = () => {
  const providers = new Map()

  const register = (key, value) => {
    providers.set(key, value)
    provide(key, value)
  }

  const unregister = (key) => {
    providers.delete(key)
  }

  // 提供注册机制
  provide('register', register)
  provide('unregister', unregister)
}
</script>
```

## 性能优化

### 1. 避免不必要的响应式
对于静态数据，避免使用响应式 API：

```vue
<script setup>
// 静态配置数据直接提供
provide('config', {
  api: 'https://api.example.com',
  timeout: 5000
})

// 只有需要响应式的数据才使用 ref/reactive
const dynamicData = ref(null)
provide('dynamic-data', dynamicData)
</script>
```

### 2. 使用 shallowRef
对于大型对象，使用 shallowRef 优化性能：

```vue
<script setup>
import { shallowRef } from 'vue'

const largeData = shallowRef({
  // 大量数据...
})

provide('large-data', largeData)
</script>
```

## 调试技巧

### 1. 开发环境检查
在开发环境中检查注入的值：

```vue
<script setup>
const injectedValue = inject('some-key', undefined, true) // 第三个参数为 true 时，如果未找到值会抛出警告

if (import.meta.env.DEV) {
  watch(() => injectedValue, (val) => {
    console.log('Injected value changed:', val)
  }, { deep: true })
}
</script>
```

### 2. 注入追踪
追踪依赖注入的来源和使用：

```vue
<script setup>
const createDebugProvider = (key, value) => {
  if (import.meta.env.DEV) {
    provide(key, value)
    console.log(`Provided ${key}:`, value)
    
    onUnmounted(() => {
      console.log(`Provider ${key} unmounted`)
    })
  } else {
    provide(key, value)
  }
}

const debugInject = (key, defaultValue) => {
  const value = inject(key, defaultValue)
  
  if (import.meta.env.DEV) {
    console.log(`Injected ${key}:`, value)
  }
  
  return value
}
</script>
```

### 3. 验证注入值
添加运行时验证：

```vue
<script setup>
const validateInjection = (key, value, validator) => {
  if (import.meta.env.DEV && !validator(value)) {
    console.warn(`Invalid injection value for key "${key}"`)
  }
  provide(key, value)
}

// 使用示例
validateInjection('count', 0, (val) => typeof val === 'number')
</script>
```
