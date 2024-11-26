# Teleport 传送组件

`Teleport` 是 Vue 3 的一个内置组件，它可以将组件的内容传送到 DOM 树的任何位置。这个功能在处理模态框、通知、弹出菜单等需要打破组件层级的场景中特别有用。

## 1. 基础用法

### 1.1 基本示例

```vue
<template>
  <button @click="open = true">打开模态框</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <h2>模态框标题</h2>
      <p>这是一个模态框内容</p>
      <button @click="open = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
```

### 1.2 动态目标

`to` 属性支持动态值：

```vue
<template>
  <Teleport :to="teleportTarget">
    <div class="notification">{{ message }}</div>
  </Teleport>
</template>

<script setup>
const teleportTarget = ref('#notification-container')
</script>
```

## 2. 高级用法

### 2.1 禁用 Teleport

使用 `disabled` 属性来控制是否传送内容：

```vue
<template>
  <Teleport to="body" :disabled="isMobile">
    <div class="floating-menu">
      <slot></slot>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isMobile = ref(false)

onMounted(() => {
  // 根据屏幕宽度决定是否禁用传送
  isMobile.value = window.innerWidth < 768
  
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})
</script>
```

### 2.2 多个 Teleport 共享目标

多个 Teleport 可以将其内容挂载到同一个目标元素：

```vue
<template>
  <Teleport to="#notifications">
    <div class="notification">通知 1</div>
  </Teleport>
  <Teleport to="#notifications">
    <div class="notification">通知 2</div>
  </Teleport>
</template>
```

## 3. 实际应用场景

### 3.1 全局通知系统

创建一个可复用的通知系统：

```vue
<!-- NotificationSystem.vue -->
<template>
  <Teleport to="#notification-container">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
        <button @click="removeNotification(notification.id)">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([])

const addNotification = (message, type = 'info') => {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  setTimeout(() => removeNotification(id), 3000)
}

const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// 暴露方法供其他组件使用
defineExpose({
  addNotification
})
</script>

<style>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.notification {
  margin: 10px;
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  background: #42b983;
}

.notification.error {
  background: #ff4444;
}

.notification.warning {
  background: #ffbb33;
}
</style>
```

### 3.2 全局对话框

创建一个可复用的对话框组件：

```vue
<!-- Dialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="dialog-overlay" @click="closeOnOverlay">
        <div class="dialog" @click.stop>
          <div class="dialog-header">
            <h3>{{ title }}</h3>
            <button class="close" @click="$emit('update:modelValue', false)">
              ×
            </button>
          </div>
          
          <div class="dialog-body">
            <slot></slot>
          </div>
          
          <div class="dialog-footer">
            <slot name="footer">
              <button @click="$emit('update:modelValue', false)">取消</button>
              <button class="primary" @click="confirm">确认</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: String,
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const closeOnOverlay = () => {
  if (props.closeOnClickOverlay) {
    emit('update:modelValue', false)
  }
}

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 过渡动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog,
.dialog-leave-active .dialog {
  transition: transform 0.3s ease;
}

.dialog-enter-from .dialog,
.dialog-leave-to .dialog {
  transform: scale(0.9);
}
</style>
```

### 3.3 上下文菜单

创建一个跟随鼠标位置的上下文菜单：

```vue
<!-- ContextMenu.vue -->
<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="show"
        class="context-menu"
        :style="{
          left: x + 'px',
          top: y + 'px'
        }"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(false)
const x = ref(0)
const y = ref(0)

const showMenu = (event) => {
  event.preventDefault()
  x.value = event.clientX
  y.value = event.clientY
  show.value = true
}

const hideMenu = () => {
  show.value = false
}

onMounted(() => {
  document.addEventListener('contextmenu', showMenu)
  document.addEventListener('click', hideMenu)
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', showMenu)
  document.removeEventListener('click', hideMenu)
})
</script>

<style>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 0;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.2s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
}
</style>
```

## 4. 性能优化

### 4.1 按需传送

只在必要时才使用 Teleport：

```vue
<template>
  <template v-if="shouldTeleport">
    <Teleport to="body">
      <heavy-component />
    </Teleport>
  </template>
  <template v-else>
    <heavy-component />
  </template>
</template>

<script setup>
const shouldTeleport = computed(() => {
  // 根据条件决定是否需要传送
  return someCondition.value
})
</script>
```

### 4.2 延迟加载

使用动态导入延迟加载传送的内容：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Teleport to="body">
    <Suspense>
      <HeavyComponent />
    </Suspense>
  </Teleport>
</template>
```

## 5. 调试技巧

### 5.1 使用 Vue DevTools

Vue DevTools 可以帮助你：
- 查看传送的组件在 DOM 中的实际位置
- 检查传送组件的 props 和事件
- 调试传送相关的问题

### 5.2 常见问题排查

1. 传送目标不存在：
   ```js
   // 确保目标元素存在
   onMounted(() => {
     const target = document.querySelector('#target')
     if (!target) {
       console.warn('Teleport target not found')
     }
   })
   ```

2. 样式问题：
   ```css
   /* 确保传送后的内容有正确的样式作用域 */
   :root {
     --teleported-z-index: 1000;
   }
   
   .teleported-content {
     z-index: var(--teleported-z-index);
   }
   ```

## 6. 最佳实践

1. **目标选择**
```vue
<Teleport to="#app-modals">
  <!-- 使用专门的容器管理传送内容 -->
</Teleport>
```

2. **动态控制**
```vue
<Teleport :to="teleportTarget" :disabled="isDisabled">
  <!-- 根据条件控制传送行为 -->
</Teleport>
```

3. **事件处理**
```vue
<script setup>
const emit = defineEmits(['teleported'])

onMounted(() => {
  // 在传送完成后触发事件
  emit('teleported')
})
</script>
```

4. **清理工作**
```vue
<script setup>
onUnmounted(() => {
  // 确保清理所有传送的内容
  cleanupTeleportedContent()
})
</script>
```

5. **可访问性**
```vue
<Teleport to="body">
  <div role="dialog" aria-modal="true">
    <!-- 确保传送内容的可访问性 -->
  </div>
</Teleport>
```
