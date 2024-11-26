# Props

Props 是 Vue 中父组件向子组件传递数据的主要方式。理解 Props 的工作原理和最佳实践对于构建可维护的组件至关重要。

## 基础知识

### Props 的本质
Props 本质上是组件的自定义属性，允许父组件向子组件传递数据。它解决了以下问题：
- 实现了组件的可重用性
- 建立了清晰的数据流向，符合单向数据流原则
- 使组件之间的接口更加明确

### 基本语法

```vue
<!-- 子组件 -->
<script setup>
defineProps({
  title: String,
  likes: Number,
  isPublished: Boolean,
})
</script>

<!-- 父组件 -->
<template>
  <BlogPost
    title="Vue 3 指南"
    :likes="42"
    :is-published="true"
  />
</template>
```

## 最佳实践

### 1. Props 类型验证
始终为 props 定义详细的类型验证，这样做的原因：
- 提供了自文档化的组件接口
- 在开发环境中可以及早发现问题
- 便于 IDE 提供更好的类型提示

```vue
<script setup>
defineProps({
  // 基础类型检查
  propA: Number,
  // 多种类型
  propB: [String, Number],
  // 必传
  propC: {
    type: String,
    required: true
  },
  // 带有默认值
  propD: {
    type: Number,
    default: 100
  },
  // 自定义验证函数
  propE: {
    validator(value) {
      return ['success', 'warning', 'danger'].includes(value)
    }
  }
})
</script>
```

### 2. 单向数据流
严格遵守单向数据流原则：
- 不在子组件中直接修改 props
- 使用计算属性或事件通知父组件进行修改
- 需要修改 prop 时，应该抛出事件而不是直接修改

```vue
<!-- ❌ 错误示范 -->
<script setup>
const props = defineProps(['value'])
// 直接修改 prop
props.value = 'new value'
</script>

<!-- ✅ 正确方式 -->
<script setup>
const props = defineProps(['value'])
const emit = defineEmits(['update:value'])

function updateValue(newValue) {
  emit('update:value', newValue)
}
</script>
```

### 3. Props 命名规范
- 在 JavaScript 中使用 camelCase
- 在模板中使用 kebab-case
- 布尔类型的 props 使用 is 前缀

```vue
<script setup>
defineProps({
  greetingMessage: String,
  isVisible: Boolean,
  userData: Object
})
</script>

<template>
  <child-component
    :greeting-message="msg"
    :is-visible="true"
    :user-data="user"
  />
</template>
```

## 高级技巧

### 1. Props 透传
当需要将 props 透传给内部组件时，可以使用 v-bind="$props"：

```vue
<template>
  <inner-component v-bind="$props" />
</template>
```

### 2. 动态 Props
使用计算属性处理需要转换的 props：

```vue
<script setup>
const props = defineProps(['size'])
const computedSize = computed(() => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }
  return sizeMap[props.size] || '40px'
})
</script>
```

### 3. Props 默认值工厂函数
对于引用类型的 props，使用工厂函数返回默认值：

```vue
<script setup>
defineProps({
  options: {
    type: Object,
    default: () => ({
      title: '',
      description: ''
    })
  }
})
</script>
```

## 性能优化

### 1. 避免过度响应
对于大型对象或不需要响应式的数据，可以使用 markRaw：

```vue
<script setup>
import { markRaw } from 'vue'

const props = defineProps(['config'])
// 对于不需要响应式的大型配置对象
const staticConfig = markRaw(props.config)
</script>
```

### 2. 缓存计算属性
对于需要大量计算的 props 转换，使用计算属性缓存结果：

```vue
<script setup>
const props = defineProps(['items'])
const processedItems = computed(() => {
  return props.items.map(item => /* 复杂计算 */)
})
</script>
```

## 调试技巧

### 1. Props 验证失败时的调试
在开发环境中，可以通过 console 追踪 props 的变化：

```vue
<script setup>
import { watch } from 'vue'

const props = defineProps(['value'])

watch(() => props.value, (newVal, oldVal) => {
  console.log('prop updated', newVal, oldVal)
}, { deep: true })
</script>
```

### 2. 使用 TypeScript 增强类型安全
使用 TypeScript 可以在开发时就发现潜在的 props 类型问题：

```vue
<script setup lang="ts">
interface Props {
  message: string
  count?: number
  isValid?: boolean
}

const props = defineProps<Props>()
</script>
```
