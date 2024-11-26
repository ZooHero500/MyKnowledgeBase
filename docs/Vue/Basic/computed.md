# Vue 计算属性

计算属性是 Vue 中一个强大的特性，它可以根据其他响应式状态派生出新的状态。以下是计算属性的最佳实践和使用场景：

## 基础计算属性

1. **数据转换和格式化**
```vue
<script setup>
import { ref, computed } from 'vue'

const price = ref(100)
const quantity = ref(2)

// ✅ 推荐：使用计算属性处理数据转换
const formattedTotal = computed(() => {
  return `$${(price.value * quantity.value).toFixed(2)}`
})

// ❌ 不推荐：在模板中直接进行复杂计算
// <template>
//   <div>${{ (price * quantity).toFixed(2) }}</div>
// </template>
</script>
```

**推荐原因：**
- 提高代码可读性，将复杂的计算逻辑从模板中抽离
- 计算结果会被缓存，只有依赖项变化时才会重新计算
- 便于复用计算逻辑，可以在多个地方使用同一个计算属性

2. **列表过滤和排序**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { name: 'iPhone', price: 999, category: 'Electronics' },
  { name: 'Book', price: 20, category: 'Books' },
  { name: 'Laptop', price: 1500, category: 'Electronics' }
])

const searchQuery = ref('')
const selectedCategory = ref('all')

// ✅ 推荐：使用计算属性处理复杂的过滤和排序逻辑
const filteredItems = computed(() => {
  return items.value
    .filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
      const matchesCategory = 
        selectedCategory.value === 'all' || 
        item.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.price - b.price)
})

// ❌ 不推荐：在模板中直接进行过滤和排序
// <template>
//   <div v-for="item in items.filter(...)">
// </template>
</script>
```

**推荐原因：**
- 避免在模板中编写复杂的过滤和排序逻辑
- 计算结果被缓存，提高性能
- 当数据源或过滤条件变化时，自动重新计算

## 可写计算属性

1. **双向数据转换**
```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// ✅ 推荐：使用可写计算属性处理双向数据转换
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`.trim()
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

// ❌ 不推荐：使用 watch 实现类似功能
// watch([firstName, lastName], ([first, last]) => {
//   fullName.value = `${first} ${last}`.trim()
// })
</script>
```

**推荐原因：**
- 提供了直观的双向数据绑定接口
- 确保数据的一致性，避免状态不同步
- 比使用 watch 实现更简洁和直观

2. **表单数据转换**
```vue
<script setup>
import { ref, computed } from 'vue'

const celsius = ref(25)

// ✅ 推荐：使用可写计算属性处理单位转换
const fahrenheit = computed({
  get() {
    return (celsius.value * 9/5) + 32
  },
  set(value) {
    celsius.value = (value - 32) * 5/9
  }
})
</script>

<template>
  <input v-model.number="celsius"> °C
  <input v-model.number="fahrenheit"> °F
</template>
```

**推荐原因：**
- 自动处理双向单位转换
- 保持数据的一致性
- 提供了清晰的数据流向

## 计算属性的缓存机制

### 基本缓存原理

计算属性会基于其响应式依赖进行缓存。只有在依赖项发生变化时才会重新计算。

```vue
<template>
  <div>
    <p>{{ expensiveComputation }}</p>
    <p>{{ expensiveComputation }}</p> <!-- 不会触发重新计算 -->
    <p>{{ normalMethod() }}</p> <!-- 每次都会重新计算 -->
    <p>{{ normalMethod() }}</p> <!-- 每次都会重新计算 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// 计算属性：只有当 count 改变时才会重新计算
const expensiveComputation = computed(() => {
  console.log('Computing...')
  return count.value * 2
})

// 方法：每次访问都会重新计算
function normalMethod() {
  console.log('Method called...')
  return count.value * 2
}
</script>
```

### 重新计算的触发条件

1. **依赖项变化**
```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只有当 firstName 或 lastName 变化时才会重新计算
const fullName = computed(() => {
  console.log('Computing full name...')
  return `${firstName.value} ${lastName.value}`
})

// 这会触发重新计算
firstName.value = 'Jane'

// 这不会触发重新计算，因为不是依赖项
const age = ref(25)
age.value = 26
</script>
```

2. **组件重新渲染**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const otherData = ref('some data')

// 即使组件重新渲染，如果依赖项（count）没有变化
// 计算属性也不会重新计算
const doubleCount = computed(() => {
  console.log('Computing double count...')
  return count.value * 2
})

// 这会导致组件重新渲染，但不会触发计算属性重新计算
otherData.value = 'new data'

// 这会导致组件重新渲染，并且触发计算属性重新计算
count.value++
</script>
```

### 深层依赖的处理

```vue
<script setup>
import { ref, computed } from 'vue'

const user = ref({
  name: 'John',
  address: {
    city: 'New York',
    country: 'USA'
  }
})

// 深层依赖：会在 user.address.city 变化时重新计算
const userLocation = computed(() => {
  console.log('Computing location...')
  return `${user.value.address.city}, ${user.value.address.country}`
})

// 这会触发重新计算
user.value.address.city = 'Los Angeles'

// 这也会触发重新计算，因为整个对象被替换
user.value = {
  name: 'John',
  address: {
    city: 'Chicago',
    country: 'USA'
  }
}
</script>
```

### 缓存失效场景

1. **非响应式依赖**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
let nonReactiveData = 1

// ⚠️ 不推荐：包含非响应式数据的计算属性
const badComputed = computed(() => {
  // nonReactiveData 的变化不会触发重新计算
  return count.value + nonReactiveData
})

// 修改非响应式数据不会触发重新计算
nonReactiveData = 2
console.log(badComputed.value) // 仍然使用旧的计算结果
</script>
```

2. **副作用和异步操作**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// ⚠️ 不推荐：在计算属性中包含副作用
const withSideEffect = computed(() => {
  // 副作用：修改其他状态
  localStorage.setItem('count', count.value)
  return count.value * 2
})

// ⚠️ 不推荐：在计算属性中使用异步操作
const asyncComputed = computed(async () => {
  // 异步操作会破坏缓存机制
  const response = await fetch(`/api/data/${count.value}`)
  return await response.json()
})
</script>
```

### 性能优化建议

1. **避免不必要的依赖**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])
const filter = ref('')

// ❌ 不好的实践：包含不必要的依赖
const badFiltered = computed(() => {
  console.log('Recomputing...')
  return items.value
    .filter(item => item > 2)
    .map(item => item * 2)
})

// ✅ 好的实践：分离不相关的计算
const filtered = computed(() => {
  console.log('Filtering...')
  return items.value.filter(item => item > 2)
})

const doubled = computed(() => {
  console.log('Doubling...')
  return filtered.value.map(item => item * 2)
})
</script>
```

2. **缓存大量计算**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([/* 大量数据 */])

// ❌ 不好的实践：每次都进行大量计算
const badComputed = computed(() => {
  return items.value.map(item => {
    return expensiveOperation(item)
  })
})

// ✅ 好的实践：使用 Map 缓存计算结果
const computeCache = new Map()
const goodComputed = computed(() => {
  return items.value.map(item => {
    if (!computeCache.has(item.id)) {
      computeCache.set(item.id, expensiveOperation(item))
    }
    return computeCache.get(item.id)
  })
})
</script>
```

### 调试技巧

1. **监控计算次数**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// 添加计算次数跟踪
let computeCount = 0
const trackedComputed = computed(() => {
  computeCount++
  console.log(`Computed ${computeCount} times`)
  return count.value * 2
})

// 用于验证缓存是否生效
function validateCache() {
  const before = computeCount
  console.log(trackedComputed.value)
  console.log(trackedComputed.value)
  console.log(`Cache hit: ${before === computeCount}`)
}
</script>
```

2. **依赖追踪**
```vue
<script setup>
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)
const multiplier = ref(2)

// 创建计算属性
const result = computed(() => count.value * multiplier.value)

// 使用 watchEffect 追踪依赖
watchEffect(() => {
  console.log('Dependencies accessed:', {
    count: count.value,
    multiplier: multiplier.value,
    result: result.value
  })
})
</script>
```

## 计算属性的性能优化

1. **避免在计算属性中进行昂贵的操作**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([/* 大量数据 */])

// ❌ 不推荐：在计算属性中进行昂贵的操作
const badExample = computed(() => {
  return items.value.map(item => {
    return someExpensiveOperation(item) // 昂贵的操作
  })
})

// ✅ 推荐：将昂贵的操作结果缓存
const itemsMap = new Map()
const goodExample = computed(() => {
  return items.value.map(item => {
    if (!itemsMap.has(item.id)) {
      itemsMap.set(item.id, someExpensiveOperation(item))
    }
    return itemsMap.get(item.id)
  })
})
</script>
```

2. **合理设置计算属性的粒度**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([/* 大量数据 */])
const searchQuery = ref('')

// ❌ 不推荐：一个计算属性做太多事情
const badExample = computed(() => {
  const filtered = items.value.filter(item => 
    item.name.includes(searchQuery.value)
  )
  const sorted = filtered.sort((a, b) => a.price - b.price)
  const grouped = sorted.reduce((acc, item) => {
    // 复杂的分组逻辑
    return acc
  }, {})
  return grouped
})

// ✅ 推荐：拆分成多个计算属性
const filteredItems = computed(() => 
  items.value.filter(item => 
    item.name.includes(searchQuery.value)
  )
)

const sortedItems = computed(() => 
  [...filteredItems.value].sort((a, b) => a.price - b.price)
)

const groupedItems = computed(() => 
  sortedItems.value.reduce((acc, item) => {
    // 分组逻辑
    return acc
  }, {})
)
</script>
```

## 计算属性 vs 方法

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// ✅ 推荐：使用计算属性缓存结果
const expensiveComputed = computed(() => {
  console.log('computing...')
  return count.value * 2
})

// ❌ 不推荐：使用方法重复计算
function expensiveMethod() {
  console.log('computing...')
  return count.value * 2
}
</script>

<template>
  <!-- 多次访问计算属性，只会计算一次 -->
  <div>{{ expensiveComputed }}</div>
  <div>{{ expensiveComputed }}</div>
  
  <!-- 多次调用方法，每次都会重新计算 -->
  <div>{{ expensiveMethod() }}</div>
  <div>{{ expensiveMethod() }}</div>
</template>
```

**使用计算属性的原因：**
- 计算结果会被缓存，只有依赖变化时才会重新计算
- 多次访问同一个计算属性不会导致重复计算
- 适合处理需要缓存的计算逻辑

**使用方法的场景：**
- 不需要缓存结果的简单计算
- 需要传递参数的计算
- 每次都需要重新计算的场景

## 计算属性的注意事项

1. **避免直接修改计算属性**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// ❌ 不推荐：在计算属性中修改其依赖项
const badComputed = computed(() => {
  if (count.value < 0) {
    count.value = 0 // 不要这样做！
  }
  return count.value
})

// ✅ 推荐：使用 watch 或其他方式处理副作用
watch(count, (newValue) => {
  if (newValue < 0) {
    count.value = 0
  }
})
</script>
```

2. **避免异步操作**
```vue
<script setup>
import { ref, computed } from 'vue'

const userId = ref(1)

// ❌ 不推荐：在计算属性中进行异步操作
const badComputed = computed(async () => {
  const response = await fetch(`/api/user/${userId.value}`)
  return await response.json()
})

// ✅ 推荐：使用 watchEffect 处理异步操作
const userData = ref(null)
watchEffect(async () => {
  userData.value = await fetch(`/api/user/${userId.value}`)
    .then(r => r.json())
})
</script>
```

**注意事项总结：**
- 计算属性应该是纯函数，不应该有副作用
- 不要在计算属性中进行异步操作
- 避免直接修改计算属性的依赖项
- 保持计算属性的简单性和可预测性

## 最佳实践总结

1. **缓存管理**
   - 确保计算属性只依赖于响应式数据
   - 避免在计算属性中使用非响应式数据
   - 对于大量计算，考虑使用额外的缓存机制

2. **性能优化**
   - 将复杂的计算属性拆分成多个简单的计算属性
   - 避免在计算属性中进行不必要的计算
   - 使用适当的缓存策略处理大量数据

3. **调试和维护**
   - 添加适当的日志来追踪计算属性的执行
   - 使用 Vue DevTools 监控计算属性的变化
   - 保持计算属性的纯函数特性
