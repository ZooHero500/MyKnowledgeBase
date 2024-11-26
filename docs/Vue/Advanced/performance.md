# Vue 性能优化

## 编译优化

### 静态提升

```vue
<template>
  <div>
    <div class="static">静态内容</div>
    <div>{{ dynamic }}</div>
  </div>
</template>
```

编译后：
```js
const _hoisted_1 = { class: "static" }
const _hoisted_2 = "静态内容"

export function render() {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", _hoisted_1, _hoisted_2),
    _createElementVNode("div", null, _toDisplayString(dynamic.value))
  ]))
}
```

### Patch 标记

```vue
<template>
  <div :class="cls" @click="onClick">{{ text }}</div>
</template>
```

编译后：
```js
export function render() {
  return _createElementVNode("div", {
    class: cls.value,
    onClick: onClick
  }, text.value, 8 /* PROPS */, ["onClick"])
}
```

## 代码优化

### 1. 计算属性缓存

```js
// 坏例子
const fullName = () => firstName.value + ' ' + lastName.value

// 好例子
const fullName = computed(() => firstName.value + ' ' + lastName.value)
```

### 2. 大列表优化

```vue
<script setup>
import { shallowRef } from 'vue'

// 使用 shallowRef 避免深层响应
const list = shallowRef(largeList)

// 使用 v-once 处理静态内容
const expensive = () => {/* 昂贵计算 */}
</script>

<template>
  <div v-once>{{ expensive() }}</div>
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 3. 事件销毁

```js
// 组件内
onMounted(() => {
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
```

### 4. 延迟加载

```js
// 路由级
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  }
]

// 组件级
const MyComponent = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

## 内存优化

### 1. 及时清理

```js
const store = {
  cache: new Map(),
  clean() {
    this.cache.clear()
  }
}

onUnmounted(() => {
  store.clean()
})
```

### 2. 避免内存泄漏

```js
// 定时器清理
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    // 操作
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// DOM 引用清理
const el = ref(null)

onUnmounted(() => {
  el.value = null
})
```

## 打包优化

### 1. 路由懒加载

```js
const routes = [
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      './views/User.vue'
    )
  }
]
```

### 2. 组件懒加载

```js
const MyComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  delay: 200,
  timeout: 3000
})
```

### 3. 第三方库按需导入

```js
// 按需导入 lodash
import debounce from 'lodash/debounce'

// 按需导入 Element Plus
import { ElButton } from 'element-plus'
```

## 运行时优化

### 1. 使用 shallowRef/shallowReactive

```js
// 深层响应，性能消耗大
const state = ref({
  nested: { objects: { here: true }}
})

// 浅层响应，性能好
const state = shallowRef({
  nested: { objects: { here: true }}
})
```

### 2. 使用 v-show 代替频繁切换的 v-if

```vue
<!-- 频繁切换用 v-show -->
<div v-show="visible">内容</div>

<!-- 很少切换用 v-if -->
<div v-if="loggedIn">用户信息</div>
```

### 3. 使用 keepAlive 缓存组件

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['UserList']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 4. 虚拟滚动

```vue
<template>
  <virtual-scroller
    :items="items"
    :item-height="50"
  >
    <template #item="{ item }">
      <div class="item">
        {{ item.name }}
      </div>
    </template>
  </virtual-scroller>
</template>
```
