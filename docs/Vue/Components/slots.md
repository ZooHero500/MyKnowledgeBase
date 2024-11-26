# 插槽 (Slots)

插槽是 Vue 中实现内容分发的重要机制，它允许父组件向子组件注入内容，是实现可复用组件的关键特性。

## 基础知识

### 插槽的本质
插槽本质上是一种内容分发机制，它解决了以下问题：
- 组件的内容复用
- 组件的灵活性
- 父子组件间的内容协作

### 基本语法

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <BaseLayout>
    <template #header>
      <h1>页面标题</h1>
    </template>

    <template #default>
      <p>主要内容</p>
    </template>

    <template #footer>
      <p>页脚内容</p>
    </template>
  </BaseLayout>
</template>
```

## 最佳实践

### 1. 默认内容
为插槽提供默认内容，增加组件的易用性：

```vue
<template>
  <button class="btn">
    <slot>
      <!-- 当没有传入内容时显示 -->
      点击按钮
    </slot>
  </button>
</template>
```

### 2. 具名插槽
使用具名插槽组织复杂的布局：

```vue
<!-- 子组件 -->
<template>
  <div class="modal">
    <header>
      <slot name="header">
        <h3>默认标题</h3>
      </slot>
    </header>
    
    <main>
      <slot></slot>
    </main>
    
    <footer>
      <slot name="footer">
        <button @click="$emit('close')">关闭</button>
      </slot>
    </footer>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <modal @close="closeModal">
    <template #header>
      <h3>自定义标题</h3>
    </template>

    <p>这是主要内容</p>

    <template #footer>
      <button @click="save">保存</button>
      <button @click="closeModal">取消</button>
    </template>
  </modal>
</template>
```

### 3. 作用域插槽
使用作用域插槽传递数据到父组件：

```vue
<!-- 子组件 -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.text }}
      </slot>
    </li>
  </ul>
</template>

<!-- 父组件使用 -->
<template>
  <my-list :items="items">
    <template #default="{ item, index }">
      <div class="item">
        <span>{{ index + 1 }}.</span>
        <strong>{{ item.text }}</strong>
        <button @click="removeItem(item.id)">删除</button>
      </div>
    </template>
  </my-list>
</template>
```

## 高级技巧

### 1. 动态插槽名
使用动态插槽名实现更灵活的内容分发：

```vue
<template>
  <base-layout>
    <template v-for="(content, name) in slots" :key="name" v-slot:[name]>
      {{ content }}
    </template>
  </base-layout>
</template>

<script setup>
const slots = {
  header: '动态头部内容',
  default: '动态主体内容',
  footer: '动态底部内容'
}
</script>
```

### 2. 插槽组合
组合多个插槽实现复杂的布局：

```vue
<!-- 可重用的卡片组件 -->
<template>
  <div class="card">
    <slot name="header" :title="title">
      <div class="card-header">
        <h3>{{ title }}</h3>
        <slot name="header-actions"></slot>
      </div>
    </slot>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div class="card-footer">
      <slot name="footer">
        <slot name="actions"></slot>
      </slot>
    </div>
  </div>
</template>
```

### 3. 条件插槽
根据条件渲染不同的插槽内容：

```vue
<template>
  <div class="component">
    <slot
      v-if="condition"
      name="primary"
      :data="primaryData"
    ></slot>
    <slot
      v-else
      name="fallback"
      :error="error"
    ></slot>
  </div>
</template>

<script setup>
const props = defineProps(['condition', 'primaryData', 'error'])
</script>
```

## 性能优化

### 1. 避免不必要的插槽更新
使用 v-once 优化静态内容：

```vue
<template>
  <div class="static-content">
    <slot name="static" v-once>
      <!-- 静态内容不会重新渲染 -->
      <heavy-component></heavy-component>
    </slot>
  </div>
</template>
```

### 2. 延迟加载插槽内容
使用动态组件实现插槽内容的延迟加载：

```vue
<template>
  <div class="lazy-slot-container">
    <template v-if="isVisible">
      <slot></slot>
    </template>
    <template v-else>
      <div class="placeholder">
        加载中...
      </div>
    </template>
  </div>
</template>

<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const container = ref(null)
const isVisible = ref(false)

useIntersectionObserver(container, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isVisible.value = true
  }
})
</script>
```

## 调试技巧

### 1. 插槽内容检查
在开发环境中检查插槽内容：

```vue
<script setup>
import { useSlots, onMounted } from 'vue'

const slots = useSlots()

onMounted(() => {
  if (import.meta.env.DEV) {
    console.log('Available slots:', Object.keys(slots))
    console.log('Default slot content:', slots.default?.())
  }
})
</script>
```

### 2. 作用域插槽数据追踪
追踪作用域插槽数据的变化：

```vue
<script setup>
const props = defineProps(['items'])

watch(() => props.items, (newItems) => {
  if (import.meta.env.DEV) {
    console.log('Slot items updated:', newItems)
  }
}, { deep: true })
</script>

<template>
  <div>
    <slot
      v-for="item in items"
      :key="item.id"
      :item="item"
      v-slot="slotProps"
    >
      <div v-if="import.meta.env.DEV">
        <!-- 开发环境下的调试信息 -->
        <pre>{{ slotProps }}</pre>
      </div>
    </slot>
  </div>
</template>
```
