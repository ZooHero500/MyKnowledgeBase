# Transition 过渡组件

Vue 的 `Transition` 组件让我们能够为任何元素或组件添加进入/离开动画。本文将通过实际案例深入讲解其用法。

## 1. 基础用法

### 1.1 CSS 过渡

最简单的过渡效果是使用 CSS transitions：

```vue
<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<template>
  <button @click="show = !show">Toggle</button>
  
  <Transition name="fade">
    <p v-if="show">Hello Vue!</p>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

::: tip 过渡类名说明
- `v-enter-from`：进入开始状态
- `v-enter-active`：进入过程状态
- `v-enter-to`：进入结束状态
- `v-leave-from`：离开开始状态
- `v-leave-active`：离开过程状态
- `v-leave-to`：离开结束状态
:::

### 1.2 CSS 动画

相比 transitions，animations 可以定义更复杂的过渡效果：

```vue
<template>
  <Transition name="bounce">
    <p v-if="show">Hello Animations!</p>
  </Transition>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
```

## 2. 高级用法

### 2.1 自定义过渡类名

可以通过以下 props 来自定义过渡类名：

```vue
<template>
  <Transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <p v-if="show">使用 Animate.css</p>
  </Transition>
</template>

<script setup>
// 需要先安装并引入 animate.css
import 'animate.css'
</script>
```

### 2.2 JavaScript 钩子

当你需要更细粒度的控制时，可以使用 JavaScript 钩子：

```vue
<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onLeaveCancelled"
  >
    <p v-if="show">JavaScript 动画</p>
  </Transition>
</template>

<script setup>
const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateX(-60px)'
}

const onEnter = (el, done) => {
  gsap.to(el, {
    duration: 0.5,
    opacity: 1,
    transform: 'translateX(0)',
    onComplete: done
  })
}

// 其他钩子函数...
</script>
```

### 2.3 复用过渡效果

可以通过组件封装来复用过渡效果：

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition
    name="fade"
    mode="out-in"
    appear
  >
    <slot></slot>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

使用封装的过渡组件：

```vue
<template>
  <FadeTransition>
    <component :is="currentComponent" />
  </FadeTransition>
</template>
```

## 3. 实际应用场景

### 3.1 列表过渡

结合 `TransitionGroup` 组件实现列表动画：

```vue
<template>
  <TransitionGroup
    name="list"
    tag="ul"
  >
    <li
      v-for="item in items"
      :key="item.id"
    >
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保移动动画流畅 */
.list-move {
  transition: transform 0.5s ease;
}
</style>
```

### 3.2 路由过渡

在路由切换时添加过渡效果：

```vue
<!-- App.vue -->
<template>
  <Transition name="fade" mode="out-in">
    <RouterView />
  </Transition>
</template>
```

### 3.3 模态框过渡

为模态框添加优雅的进入/离开动画：

```vue
<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(1.1);
}
</style>
```

## 4. 性能优化

### 4.1 CSS vs JavaScript

- 优先使用 CSS 动画，因为它们在性能上更优
- 对于复杂动画，使用 JavaScript 可以获得更好的控制
- 考虑使用 `will-change` CSS 属性来优化性能

```css
.my-animation {
  will-change: transform, opacity;
}
```

### 4.2 强制浏览器重绘

有时需要强制浏览器重绘以确保动画正常：

```js
const onBeforeEnter = (el) => {
  // 强制重绘
  el.offsetHeight
}
```

## 5. 调试技巧

### 5.1 使用 Vue DevTools

Vue DevTools 可以帮助你：
- 检查过渡组件的状态
- 观察过渡事件的触发时机
- 调试过渡相关的问题

### 5.2 常见问题排查

1. 过渡不生效：
   - 检查是否正确设置了 name 属性
   - 确认 CSS 类名是否正确
   - 验证元素是否可过渡的属性

2. 过渡闪烁：
   - 检查是否设置了正确的 mode
   - 确认过渡时间是否合适

::: tip
使用 `mode="out-in"` 可以避免很多过渡相关的问题，它确保了进入和离开动画的正确顺序。
:::

## 6. 最佳实践

1. **命名规范**
```vue
<Transition name="fade"> <!-- 使用语义化的名称 -->
```

2. **模式选择**
```vue
<Transition mode="out-in"> <!-- 对于替换元素，推荐使用 out-in 模式 -->
```

3. **动画时间**
```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; /* 保持较短的动画时间，提升用户体验 */
}
```

4. **条件渲染**
```vue
<Transition>
  <component :is="currentView" /> <!-- 优先使用动态组件 -->
</Transition>
```

5. **性能考虑**
```vue
<Transition :css="false"> <!-- 纯 JavaScript 动画时禁用 CSS -->
```
