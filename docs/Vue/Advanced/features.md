# Vue 高级特性

## 自定义指令

```js
// 全局注册
app.directive('focus', {
  mounted: (el) => el.focus()
})

// 局部注册
const directives = {
  focus: {
    mounted: (el) => el.focus()
  }
}
```

使用：
```vue
<input v-focus />
```

## 插件

```js
const myPlugin = {
  install(app, options) {
    // 注入全局属性
    app.config.globalProperties.$http = axios
    
    // 注册全局组件
    app.component('MyComponent', MyComponent)
    
    // 注册全局指令
    app.directive('focus', focus)
    
    // 注册全局 mixin
    app.mixin({
      created() {
        // 逻辑
      }
    })
  }
}

app.use(myPlugin, {
  // 配置项
})
```

## 渲染函数

```js
import { h } from 'vue'

const App = {
  render() {
    return h('div', {
      onClick: this.onClick
    }, [
      h('span', 'Hello'),
      h('span', 'World')
    ])
  }
}
```

## Teleport

将内容渲染到 DOM 树的其他位置：

```vue
<template>
  <teleport to="body">
    <div class="modal">
      <h2>模态框标题</h2>
      <slot />
      <button @click="close">关闭</button>
    </div>
  </teleport>
</template>
```

## Suspense

处理异步组件：

```vue
<template>
  <suspense>
    <template #default>
      <async-component />
    </template>
    <template #fallback>
      <loading-component />
    </template>
  </suspense>
</template>
```

## 依赖注入

```js
// 父组件提供
import { provide } from 'vue'

provide('key', value)

// 子组件注入
import { inject } from 'vue'

const value = inject('key')
```

## 自定义 Ref

```js
import { customRef } from 'vue'

function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
```

## 渲染优化

### 1. v-once

只渲染一次的内容：

```vue
<template>
  <div v-once>{{ expensive() }}</div>
</template>
```

### 2. v-memo

记忆化渲染：

```vue
<template>
  <div v-memo="[item.id]">
    <expensive-component :item="item" />
  </div>
</template>
```

### 3. 虚拟列表

```vue
<script setup>
import { ref } from 'vue'
import VirtualList from './VirtualList.vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`
})))
</script>

<template>
  <virtual-list
    :items="items"
    :item-height="30"
    :visible-items="10"
  >
    <template #item="{ item }">
      {{ item.text }}
    </template>
  </virtual-list>
</template>
```

## 动态组件

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { shallowRef } from 'vue'
import CompA from './CompA.vue'
import CompB from './CompB.vue'

const currentComponent = shallowRef(CompA)

function switchComponent() {
  currentComponent.value = currentComponent.value === CompA ? CompB : CompA
}
</script>
```

## 异步组件

```js
// 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 高级用法
const AsyncComp = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```
