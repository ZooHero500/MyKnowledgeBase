# Vue 事件处理

## 事件处理基础

### 事件监听

在 Vue 中，我们使用 `v-on` 指令（简写为 `@`）来监听 DOM 事件。

```vue
<template>
  <div>
    <!-- 基本事件监听 -->
    <button v-on:click="handleClick">点击</button>
    
    <!-- 使用简写 -->
    <button @click="handleClick">点击</button>
    
    <!-- 内联处理器 -->
    <button @click="count++">加 1</button>
    
    <!-- 方法处理器 -->
    <button @click="handleClick">处理点击</button>
    
    <!-- 带参数的方法 -->
    <button @click="handleClick(123, $event)">带参数</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function handleClick(value, event) {
  console.log('点击值：', value)
  console.log('事件对象：', event)
}
</script>
```

### 事件修饰符

Vue 提供了多种事件修饰符来处理常见的事件操作：

```vue
<template>
  <div>
    <!-- 阻止默认行为 -->
    <a @click.prevent="handleClick">链接</a>
    
    <!-- 阻止事件冒泡 -->
    <div @click="handleOuter">
      <button @click.stop="handleInner">内部按钮</button>
    </div>
    
    <!-- 只触发一次 -->
    <button @click.once="handleOnce">只触发一次</button>
    
    <!-- 捕获阶段触发 -->
    <div @click.capture="handleCapture">
      <button @click="handleClick">按钮</button>
    </div>
    
    <!-- 只在事件目标上触发 -->
    <div @click.self="handleSelf">
      <button @click="handleClick">按钮</button>
    </div>
  </div>
</template>

<script setup>
function handleClick(e) {
  console.log('点击')
}

function handleOuter() {
  console.log('外部点击')
}

function handleInner() {
  console.log('内部点击')
}

function handleOnce() {
  console.log('只触发一次')
}

function handleCapture() {
  console.log('捕获阶段')
}

function handleSelf(e) {
  console.log('只在目标上触发')
}
</script>
```

### 按键修饰符

Vue 为键盘事件提供了丰富的按键修饰符：

```vue
<template>
  <div>
    <!-- 按键码 -->
    <input @keyup.13="submit">
    
    <!-- 按键别名 -->
    <input @keyup.enter="submit">
    <input @keyup.tab="handleTab">
    <input @keyup.delete="handleDelete">
    <input @keyup.esc="handleEsc">
    <input @keyup.space="handleSpace">
    <input @keyup.up="handleUp">
    <input @keyup.down="handleDown">
    <input @keyup.left="handleLeft">
    <input @keyup.right="handleRight">
    
    <!-- 系统按键修饰符 -->
    <div @click.ctrl="handleCtrlClick">Ctrl + Click</div>
    <div @click.alt="handleAltClick">Alt + Click</div>
    <div @click.shift="handleShiftClick">Shift + Click</div>
    <div @click.meta="handleMetaClick">Meta + Click</div>
    
    <!-- 组合按键 -->
    <div @keyup.alt.enter="handleAltEnter">Alt + Enter</div>
    <div @click.ctrl.shift="handleCtrlShift">Ctrl + Shift + Click</div>
  </div>
</template>

<script setup>
function submit() {
  console.log('提交')
}

function handleTab() {
  console.log('Tab 键')
}

function handleDelete() {
  console.log('Delete 键')
}

function handleEsc() {
  console.log('Esc 键')
}

function handleSpace() {
  console.log('空格键')
}

function handleUp() {
  console.log('上箭头')
}

function handleDown() {
  console.log('下箭头')
}

function handleLeft() {
  console.log('左箭头')
}

function handleRight() {
  console.log('右箭头')
}

function handleCtrlClick() {
  console.log('Ctrl + Click')
}

function handleAltClick() {
  console.log('Alt + Click')
}

function handleShiftClick() {
  console.log('Shift + Click')
}

function handleMetaClick() {
  console.log('Meta + Click')
}

function handleAltEnter() {
  console.log('Alt + Enter')
}

function handleCtrlShift() {
  console.log('Ctrl + Shift + Click')
}
</script>
```

## 事件机制深入

### 事件冒泡和捕获

Vue 的事件处理遵循 DOM 事件流的三个阶段：捕获阶段、目标阶段和冒泡阶段。

```vue
<template>
  <div @click.capture="handleCapture(1)" @click="handleBubble(1)">
    div1
    <div @click.capture="handleCapture(2)" @click="handleBubble(2)">
      div2
      <div @click.capture="handleCapture(3)" @click="handleBubble(3)">
        div3
      </div>
    </div>
  </div>
</template>

<script setup>
function handleCapture(level) {
  console.log(`捕获阶段 - div${level}`)
}

function handleBubble(level) {
  console.log(`冒泡阶段 - div${level}`)
}
</script>

<style scoped>
div {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
```

### 事件委托

利用事件冒泡实现事件委托，提高性能：

```vue
<template>
  <div>
    <!-- ❌ 不推荐：为每个项添加事件监听 -->
    <div class="bad-practice">
      <div
        v-for="item in items"
        :key="item.id"
        @click="handleClick(item)"
      >
        {{ item.name }}
      </div>
    </div>
    
    <!-- ✅ 推荐：使用事件委托 -->
    <div class="good-practice" @click="handleDelegation">
      <div
        v-for="item in items"
        :key="item.id"
        :data-id="item.id"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `项目 ${i}`
})))

// 不推荐：每个项都有自己的事件处理器
function handleClick(item) {
  console.log('点击项目：', item)
}

// 推荐：使用事件委托
function handleDelegation(e) {
  const target = e.target
  const id = target.getAttribute('data-id')
  if (id !== null) {
    const item = items.value[parseInt(id)]
    console.log('委托处理点击：', item)
  }
}
</script>
```

### 自定义事件

在 Vue 中，我们可以创建和触发自定义事件：

```vue
<!-- 父组件 -->
<template>
  <div>
    <custom-button
      @click="handleClick"
      @custom-event="handleCustom"
      @update:value="handleUpdate"
    />
  </div>
</template>

<script setup>
function handleClick() {
  console.log('普通点击')
}

function handleCustom(value) {
  console.log('自定义事件：', value)
}

function handleUpdate(value) {
  console.log('更新事件：', value)
}
</script>

<!-- 子组件：CustomButton.vue -->
<template>
  <button
    @click="handleClick"
    @mouseenter="handleMouseEnter"
  >
    自定义按钮
  </button>
</template>

<script setup>
const emit = defineEmits(['click', 'custom-event', 'update:value'])

function handleClick() {
  emit('click')
  emit('custom-event', { type: 'click', timestamp: Date.now() })
}

function handleMouseEnter() {
  emit('update:value', 'new value')
}
</script>
```

## 事件性能优化

### 1. 防抖和节流

使用防抖和节流来优化频繁触发的事件：

```vue
<template>
  <div>
    <!-- 未优化的搜索 -->
    <input
      type="text"
      @input="handleSearch"
      placeholder="未优化的搜索"
    >
    
    <!-- 使用防抖的搜索 -->
    <input
      type="text"
      @input="debouncedSearch"
      placeholder="防抖搜索"
    >
    
    <!-- 使用节流的滚动处理 -->
    <div
      class="scroll-container"
      @scroll="throttledScroll"
    >
      <div v-for="i in 100" :key="i">
        滚动内容 {{ i }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 未优化的搜索
function handleSearch(e) {
  console.log('搜索：', e.target.value)
}

// 防抖函数
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
function throttle(fn, delay) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      fn.apply(this, args)
      last = now
    }
  }
}

// 使用防抖的搜索
const debouncedSearch = debounce((e) => {
  console.log('防抖搜索：', e.target.value)
}, 300)

// 使用节流的滚动处理
const throttledScroll = throttle((e) => {
  console.log('节流滚动：', e.target.scrollTop)
}, 200)
</script>

<style scoped>
.scroll-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
</style>
```

### 2. 使用 passive 修饰符

对于滚动事件，使用 passive 修饰符来提高性能：

```vue
<template>
  <div>
    <!-- 使用 passive 修饰符 -->
    <div
      class="scroll-container"
      @scroll.passive="handleScroll"
    >
      <div v-for="i in 100" :key="i">
        滚动内容 {{ i }}
      </div>
    </div>
  </div>
</template>

<script setup>
function handleScroll(e) {
  // 这里不应该使用 e.preventDefault()
  console.log('滚动位置：', e.target.scrollTop)
}
</script>
```

## 高级应用场景

### 1. 手势识别

实现基本的手势识别系统：

```vue
<template>
  <div
    ref="gestureEl"
    class="gesture-area"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    {{ gesture }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const gesture = ref('等待手势...')
let startX = 0
let startY = 0
let startTime = 0

function handleTouchStart(e) {
  const touch = e.touches[0]
  startX = touch.clientX
  startY = touch.clientY
  startTime = Date.now()
}

function handleTouchMove(e) {
  e.preventDefault()
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY
  const deltaTime = Date.now() - startTime

  // 判断手势类型
  if (deltaTime < 300) { // 快速手势
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
      gesture.value = deltaX > 0 ? '右滑' : '左滑'
    } else if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < 30) {
      gesture.value = deltaY > 0 ? '下滑' : '上滑'
    }
  } else { // 慢速手势
    if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
      gesture.value = '拖动'
    }
  }
}
</script>

<style scoped>
.gesture-area {
  width: 300px;
  height: 300px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}
</style>
```

### 2. 自定义拖放系统

实现一个基本的拖放系统：

```vue
<template>
  <div class="drag-drop-container">
    <!-- 拖动源 -->
    <div class="draggable-items">
      <div
        v-for="item in items"
        :key="item.id"
        class="draggable-item"
        draggable="true"
        @dragstart="handleDragStart(item)"
        @dragend="handleDragEnd"
      >
        {{ item.name }}
      </div>
    </div>
    
    <!-- 放置目标 -->
    <div
      class="drop-zone"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'drop-active': isDragOver }"
    >
      放置区域
      <div v-for="item in droppedItems" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '项目 1' },
  { id: 2, name: '项目 2' },
  { id: 3, name: '项目 3' }
])

const droppedItems = ref([])
const isDragOver = ref(false)
let draggedItem = null

function handleDragStart(item) {
  draggedItem = item
  // 设置拖动效果
  event.dataTransfer.effectAllowed = 'move'
  // 设置自定义数据
  event.dataTransfer.setData('text/plain', item.id)
}

function handleDragEnd() {
  draggedItem = null
}

function handleDragEnter(e) {
  isDragOver.value = true
}

function handleDragOver(e) {
  // 必须阻止默认行为才能触发 drop 事件
  e.preventDefault()
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragOver.value = false
  
  if (draggedItem) {
    // 添加到已放置项目列表
    droppedItems.value.push(draggedItem)
    // 从原列表中移除
    const index = items.value.findIndex(item => item.id === draggedItem.id)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.drag-drop-container {
  display: flex;
  gap: 20px;
}

.draggable-items, .drop-zone {
  padding: 20px;
  border: 1px solid #ccc;
  min-height: 200px;
}

.draggable-item {
  padding: 10px;
  margin: 5px;
  background: #f0f0f0;
  cursor: move;
}

.drop-zone {
  flex: 1;
  background: #f8f8f8;
}

.drop-active {
  background: #e0e0e0;
  border: 2px dashed #666;
}
</style>
```

### 3. 事件总线

虽然 Vue 3 移除了全局事件总线，但我们可以实现一个简单的事件总线来处理跨组件通信：

```typescript
// eventBus.ts
type EventHandler = (...args: any[]) => void

class EventBus {
  private events: Map<string, EventHandler[]>

  constructor() {
    this.events = new Map()
  }

  // 订阅事件
  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(handler)
  }

  // 取消订阅
  off(event: string, handler: EventHandler) {
    if (!this.events.has(event)) return
    if (!handler) {
      this.events.delete(event)
      return
    }
    const handlers = this.events.get(event)!
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
    if (handlers.length === 0) {
      this.events.delete(event)
    }
  }

  // 触发事件
  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return
    this.events.get(event)!.forEach(handler => {
      handler(...args)
    })
  }

  // 只订阅一次
  once(event: string, handler: EventHandler) {
    const wrapper = (...args: any[]) => {
      handler(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

export const eventBus = new EventBus()
```

使用事件总线：

```vue
<!-- ComponentA.vue -->
<template>
  <button @click="sendMessage">发送消息</button>
</template>

<script setup>
import { eventBus } from './eventBus'

function sendMessage() {
  eventBus.emit('custom-message', {
    type: 'notification',
    content: '来自组件 A 的消息'
  })
}
</script>

<!-- ComponentB.vue -->
<template>
  <div>
    <p>最后收到的消息: {{ lastMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from './eventBus'

const lastMessage = ref('')

// 消息处理函数
function handleMessage(data) {
  lastMessage.value = data.content
}

// 组件挂载时订阅事件
onMounted(() => {
  eventBus.on('custom-message', handleMessage)
})

// 组件卸载时取消订阅
onUnmounted(() => {
  eventBus.off('custom-message', handleMessage)
})
</script>
```

### 4. 自定义事件系统

实现一个支持事件委托和冒泡的自定义事件系统：

```vue
<template>
  <div class="custom-event-system" @click="handleEvent">
    <div class="event-container" data-type="container">
      <button 
        v-for="item in items" 
        :key="item.id"
        :data-id="item.id"
        :data-type="item.type"
        class="event-item"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '按钮 1', type: 'button' },
  { id: 2, name: '按钮 2', type: 'button' },
  { id: 3, name: '按钮 3', type: 'button' }
])

// 事件处理器映射
const handlers = {
  button: handleButtonClick,
  container: handleContainerClick
}

// 事件处理函数
function handleEvent(e) {
  let target = e.target
  const path = []
  
  // 构建事件路径
  while (target && target !== e.currentTarget) {
    const type = target.dataset.type
    if (type) {
      path.push({
        type,
        element: target,
        id: target.dataset.id
      })
    }
    target = target.parentElement
  }
  
  // 模拟事件捕获阶段
  for (let i = path.length - 1; i >= 0; i--) {
    const current = path[i]
    const handler = handlers[current.type]
    if (handler) {
      const shouldContinue = handler(current, e, 'capture')
      if (shouldContinue === false) return
    }
  }
  
  // 模拟事件冒泡阶段
  for (let i = 0; i < path.length; i++) {
    const current = path[i]
    const handler = handlers[current.type]
    if (handler) {
      const shouldContinue = handler(current, e, 'bubble')
      if (shouldContinue === false) return
    }
  }
}

function handleButtonClick(data, event, phase) {
  console.log(`按钮点击 - ID: ${data.id}, 阶段: ${phase}`)
  // 返回 false 可以阻止事件继续传播
  return true
}

function handleContainerClick(data, event, phase) {
  console.log(`容器点击 - 阶段: ${phase}`)
  return true
}
</script>

<style scoped>
.custom-event-system {
  padding: 20px;
  border: 1px solid #ccc;
}

.event-container {
  padding: 20px;
  background: #f0f0f0;
}

.event-item {
  margin: 5px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
}
</style>
```

## 事件处理最佳实践

### 1. 性能优化最佳实践

1. **事件委托**
   - 对于列表项使用事件委托
   - 合理使用自定义属性存储数据
   - 避免过深的 DOM 遍历

2. **防抖和节流**
   - 搜索输入使用防抖
   - 滚动事件使用节流
   - 窗口调整使用节流

3. **事件监听器管理**
   - 及时清理不需要的事件监听器
   - 使用 passive 标志提高滚动性能
   - 避免重复添加相同的事件监听器

### 2. 代码组织最佳实践

1. **事件处理函数命名**
   - 使用动词前缀（handle、on、process）
   - 清晰表达事件类型和目的
   - 保持命名一致性

2. **事件处理逻辑分离**
   - 将复杂的事件处理逻辑提取到单独的函数
   - 使用计算属性处理派生状态
   - 使用组合式函数封装可重用的事件逻辑

3. **错误处理**
   - 为事件处理器添加错误边界
   - 使用 try-catch 捕获可能的错误
   - 提供合适的错误反馈

### 3. 调试技巧

1. **事件监控**
   - 使用 Vue DevTools 监控事件触发
   - 添加适当的日志记录
   - 使用性能分析工具评估事件处理性能

2. **常见问题排查**
   - 事件重复触发
   - 内存泄漏
   - 事件顺序问题

3. **测试策略**
   - 单元测试事件处理函数
   - 集成测试事件流程
   - 性能测试高频事件处理

## 总结

1. **基础概念**
   - 事件监听和处理
   - 事件修饰符
   - 按键修饰符

2. **进阶特性**
   - 事件委托
   - 自定义事件
   - 事件总线

3. **性能优化**
   - 防抖和节流
   - 事件委托
   - Passive 事件监听器

4. **最佳实践**
   - 代码组织
   - 性能优化
   - 调试技巧

5. **高级应用**
   - 手势识别
   - 拖放系统
   - 自定义事件系统
