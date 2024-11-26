# Vue 响应式系统

## ref vs reactive 的选择原则

在 Vue 3 中，我们有两种主要的响应式 API：`ref` 和 `reactive`。它们各自适用于不同的场景：

### ref 的使用场景及原因

1. **处理原始类型数据**
```vue
<script setup>
import { ref } from 'vue'

// 推荐：使用 ref 处理原始类型
const count = ref(0)
const message = ref('')
const isVisible = ref(true)

// 不推荐：直接使用响应式对象的属性
const state = reactive({ count: 0 })
</script>
```

**推荐原因：**
- 原始类型（如 number、string、boolean）在 JavaScript 中是值传递的，使用 `ref` 可以创建一个包装对象，确保值的响应性
- `ref` 的 `.value` 属性提供了明确的提示，表明我们在处理一个响应式引用
- 避免了响应式对象解构时丢失响应性的问题

2. **需要传递响应式数据时**
```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 推荐：ref 可以轻松传递且保持响应性
const userInfo = ref({
  name: 'John',
  age: 25
})
</script>

<template>
  <ChildComponent :user="userInfo" />
</template>
```

**推荐原因：**
- `ref` 在传递给子组件时会自动解包，子组件可以直接使用
- 即使解构也能保持响应性，因为解构的是 `.value` 属性
- 在跨组件传递数据时更容易追踪数据流向

3. **异步数据处理**
```vue
<script setup>
import { ref } from 'vue'

// 推荐：使用 ref 处理异步数据
const userData = ref(null)

async function fetchUserData() {
  const response = await fetch('/api/user')
  userData.value = await response.json()
}
</script>
```

**推荐原因：**
- 异步数据通常需要一个初始值（null 或空数组/对象），`ref` 可以优雅地处理这种情况
- 直接替换整个值的操作更符合异步数据的更新模式
- 便于处理加载状态和错误状态

### reactive 的使用场景及原因

1. **复杂对象状态管理**
```vue
<script setup>
import { reactive } from 'vue'

// 推荐：使用 reactive 管理相关联的数据
const userState = reactive({
  profile: {
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  },
  posts: [],
  followers: []
})

// 不推荐：过度分散的 ref
const name = ref('')
const email = ref('')
const theme = ref('light')
const notifications = ref(true)
const posts = ref([])
const followers = ref([])
</script>
```

**推荐原因：**
- 当数据之间有明确的关联关系时，使用 `reactive` 可以更好地组织和维护状态
- 避免了创建过多零散的 ref，提高代码的可维护性
- 对象的属性访问更自然，不需要 .value
- 深层响应性，自动跟踪所有嵌套属性的变化

2. **表单数据处理**
```vue
<script setup>
import { reactive } from 'vue'

// 推荐：使用 reactive 管理表单状态
const formState = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  validation: {
    usernameError: '',
    passwordError: '',
    confirmError: ''
  },
  async validate() {
    this.validation.usernameError = 
      this.username.length < 3 ? '用户名太短' : ''
    // ... 其他验证逻辑
  }
})
</script>
```

**推荐原因：**
- 表单数据通常包含多个相关字段，使用 reactive 可以将它们组织在一起
- 可以在同一个对象中包含表单验证逻辑，使代码更内聚
- 方便实现表单验证和提交逻辑
- v-model 绑定更简洁，不需要 .value

## 监听器的选择原则

### watch 的使用场景及原因

1. **依赖多个数据源**
```vue
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('')
const lastName = ref('')
const fullName = ref('')

// 推荐：监听多个数据源
watch(
  [firstName, lastName],
  ([newFirst, newLast]) => {
    fullName.value = `${newFirst} ${newLast}`.trim()
  }
)
</script>
```

**推荐原因：**
- 可以同时监听多个数据源的变化
- 能够访问新值和旧值，便于比较和处理
- 可以控制监听器的触发时机（通过 immediate 和 deep 选项）

2. **需要旧值的场景**
```vue
<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const searchHistory = ref([])

// 推荐：需要比较新旧值
watch(searchQuery, (newQuery, oldQuery) => {
  if (newQuery !== oldQuery && newQuery.trim()) {
    searchHistory.value.push(newQuery)
  }
})
</script>
```

**推荐原因：**
- 提供新值和旧值的比较能力
- 可以避免不必要的操作
- 适合需要记录变化历史的场景

### watchEffect 的使用场景及原因

1. **自动收集依赖**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const userData = ref(null)

// 推荐：自动追踪响应式依赖
watchEffect(async () => {
  userData.value = await fetch(
    ${`/api/user/${userId.value}`}
  ).then(r => r.json())
})
</script>
```

**推荐原因：**
- 自动追踪内部使用的响应式依赖
- 代码更简洁，不需要显式声明依赖
- 适合处理有多个依赖项的异步操作

2. **副作用清理**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const socketUrl = ref('wss://example.com')
const messages = ref([])

// 推荐：需要清理副作用的场景
watchEffect((onCleanup) => {
  const ws = new WebSocket(socketUrl.value)
  
  ws.addEventListener('message', (e) => {
    messages.value.push(JSON.parse(e.data))
  })
  
  onCleanup(() => {
    ws.close()
  })
})
</script>
```

**推荐原因：**
- 提供了内置的清理机制
- 适合处理需要清理的副作用（如事件监听器、定时器、WebSocket 连接等）
- 在依赖变化或组件卸载时自动执行清理

### watchPostEffect 的使用场景及原因

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const content = ref('')

// 推荐：需要在 DOM 更新后执行的操作
watchPostEffect(() => {
  // 确保 DOM 已更新
  updateScrollPosition()
  highlightCode()
})
</script>
```

**推荐原因：**
- 确保在 DOM 更新完成后执行操作
- 适合处理需要访问更新后的 DOM 元素的场景
- 避免了手动使用 nextTick 的需求

### watchSyncEffect 的使用场景及原因

```vue
<script setup>
import { ref, watchSyncEffect } from 'vue'

const elementWidth = ref(0)
const elementHeight = ref(0)

// 推荐：需要同步执行的场景
watchSyncEffect(() => {
  // 在状态改变时立即更新布局
  updateLayout(elementWidth.value, elementHeight.value)
})
</script>
```

**推荐原因：**
- 同步执行，没有异步延迟
- 适合处理需要立即响应的场景
- 对性能敏感的操作（但要谨慎使用，因为可能影响性能）

## 性能考虑

1. **ref vs reactive 的性能影响**
- `ref` 在处理原始值时性能更好，因为只需要追踪一个 `.value` 属性
- `reactive` 在处理大型对象时可能带来更多性能开销，因为需要递归地设置代理

2. **监听器的性能优化**
- 使用 `watchEffect` 时要注意依赖收集的范围，避免不必要的更新
- 对于大型数据结构，考虑使用 `watch` 配合精确的依赖声明
- 合理使用 `deep` 选项，避免不必要的深层监听

3. **清理和内存管理**
- 及时清理不再需要的监听器
- 使用 `onCleanup` 处理副作用
- 避免在监听器中创建无限增长的数据结构

## 实际应用示例

### 购物车功能
```vue
<script setup>
import { reactive, ref, watch } from 'vue'

// 使用 reactive 管理购物车状态
const cart = reactive({
  items: [],
  total: 0,
  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      this.items.push({ ...product, quantity: 1 })
    }
  },
  removeItem(productId) {
    const index = this.items.findIndex(item => item.id === productId)
    if (index > -1) {
      this.items.splice(index, 1)
    }
  }
})

// 使用 ref 管理折扣码
const discountCode = ref('')
const discount = ref(0)

// 使用 watch 计算总价
watch(
  () => [...cart.items],
  (items) => {
    cart.total = items.reduce((sum, item) => 
      sum + item.price * item.quantity, 0)
  },
  { deep: true }
)

// 使用 watchEffect 处理折扣
watchEffect(() => {
  if (discountCode.value === 'SAVE10') {
    discount.value = cart.total * 0.1
  } else {
    discount.value = 0
  }
})
</script>

<template>
  <div class="cart">
    <div v-for="item in cart.items" :key="item.id">
      {{ item.name }} - {{ item.quantity }} x {{ item.price }}
      <button @click="cart.removeItem(item.id)">删除</button>
    </div>
    
    <input v-model="discountCode" placeholder="输入折扣码">
    
    <div class="summary">
      <p>小计: {{ cart.total }}</p>
      <p>折扣: {{ discount }}</p>
      <p>总计: {{ cart.total - discount }}</p>
    </div>
  </div>
</template>
```

### 实时搜索功能
```vue
<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const error = ref(null)

// 使用 watch 处理防抖搜索
watch(searchQuery, async (newQuery) => {
  if (newQuery.trim() === '') {
    searchResults.value = []
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    // 模拟 API 调用
    const response = await fetch(
      ${`/api/search?q=${encodeURIComponent(newQuery)}`}
    )
    searchResults.value = await response.json()
  } catch (err) {
    error.value = '搜索失败，请稍后重试'
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}, { debounce: 300 }) // 添加防抖
</script>

<template>
  <div class="search">
    <input 
      v-model="searchQuery"
      placeholder="搜索..."
      :disabled="isLoading"
    >
    
    <div v-if="isLoading">搜索中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="result in searchResults" :key="result.id">
        {{ result.title }}
      </div>
    </div>
  </div>
</template>
```

## 最佳实践总结

1. **选择响应式 API**
   - 使用 `ref` 处理单一值和原始类型
   - 使用 `reactive` 处理复杂对象和相关状态
   - 避免过度使用 `reactive`，保持状态简单可预测

2. **监听器选择**
   - 使用 `watch` 处理特定数据源的变化
   - 使用 `watchEffect` 自动追踪依赖
   - 使用 `watchPostEffect` 处理 DOM 更新后的操作
   - 使用 `watchSyncEffect` 处理需要同步执行的场景

3. **性能优化**
   - 合理使用 `deep` 选项
   - 及时清理不需要的监听器
   - 使用 `debounce` 或 `throttle` 处理频繁更新

4. **清理和内存管理**
   - 及时清理不再需要的监听器
   - 使用 `onCleanup` 处理副作用
   - 避免在监听器中创建无限增长的数据结构
