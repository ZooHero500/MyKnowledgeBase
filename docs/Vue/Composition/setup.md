# 组合式 API

## setup 函数

Vue 3 的组件编写方式，用于组织组件逻辑。

### 基本用法

```vue
<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    onMounted(() => {
      console.log('mounted')
    })
    
    return {
      count,
      increment
    }
  }
}
</script>
```

### setup 语法糖

Vue 3.2 引入的简化写法。

```vue
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log('mounted')
})
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### Props 和 Context

```vue
<script>
export default {
  props: {
    title: String
  },
  setup(props, context) {
    console.log(props.title)
    
    const { attrs, slots, emit } = context
    
    const handleClick = () => {
      emit('custom-event', 'hello')
    }
    
    return {
      handleClick
    }
  }
}
</script>
```

### Props 和 Emits 定义

```vue
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update', 'delete'])

console.log(props.title)

const handleUpdate = () => {
  emit('update', { id: 1 })
}
</script>
```

## 最佳实践

### 响应式数据

```vue
<script setup>
import { ref, computed } from 'vue'

// ref 用于基本类型
const count = ref(0)

// reactive 用于对象
const state = reactive({
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
})

// 计算属性
const doubleCount = computed(() => count.value * 2)
</script>
```

### 组合函数

```js
// useCounter.js
import { ref } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return {
    count,
    increment,
    decrement
  }
}
```

### 生命周期

```vue
<script setup>
import { onMounted, onUnmounted, onUpdated } from 'vue'

onMounted(() => {
  console.log('mounted')
})

onUpdated(() => {
  console.log('updated')
})

onUnmounted(() => {
  console.log('unmounted')
})
</script>
```

### 异步操作

```vue
<script setup>
import { ref } from 'vue'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const response = await fetch('https://api.example.com/data')
    data.value = await response.json()
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
</script>
