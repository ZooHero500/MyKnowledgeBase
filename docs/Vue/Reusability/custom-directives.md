# 自定义指令

自定义指令是 Vue 中用于直接操作 DOM 的一种机制，它可以扩展 HTML 元素的能力，实现一些特殊的交互效果。

## 核心概念

### 什么是自定义指令？

自定义指令是一种可以直接操作 DOM 的机制，主要用于：
- 对 DOM 元素进行底层操作
- 复用涉及 DOM 操作的代码
- 扩展元素的功能

### 生命周期钩子

自定义指令提供了以下钩子函数：
- `created`: 元素的指令被创建时
- `beforeMount`: 指令绑定到元素后，元素被添加到父节点之前
- `mounted`: 元素被添加到父节点时
- `beforeUpdate`: 元素更新之前
- `updated`: 元素更新之后
- `beforeUnmount`: 元素被移除之前
- `unmounted`: 元素被移除之后

## 最佳实践

### 1. 基础指令

```ts
// v-focus
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

// 使用
<script setup>
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```

### 2. 带参数的指令

```ts
// v-color
const vColor = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    // binding.value 获取指令的值
    el.style.color = binding.value
    
    // binding.arg 获取指令的参数
    if (binding.arg === 'background') {
      el.style.backgroundColor = binding.value
    }
    
    // binding.modifiers 获取指令的修饰符
    if (binding.modifiers.important) {
      el.style.setProperty('color', binding.value, 'important')
    }
  }
}

// 使用
<div v-color:background.important="'red'">
  This text will have a red background
</div>
```

### 3. 响应式更新

```ts
// v-highlight
const vHighlight = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    el.style.backgroundColor = binding.value
  },
  updated: (el: HTMLElement, binding: DirectiveBinding) => {
    el.style.backgroundColor = binding.value
  }
}

// 使用
<template>
  <div v-highlight="color">
    Highlighted text
  </div>
</template>

<script setup>
const color = ref('yellow')

// 颜色会随着 color 的变化而变化
setTimeout(() => {
  color.value = 'green'
}, 1000)
</script>
```

## 进阶技巧

### 1. 复杂交互指令

```ts
// v-draggable
const vDraggable = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    el.style.position = 'absolute'
    el.style.cursor = 'move'

    let startX: number, startY: number
    let initialX: number, initialY: number
    
    function handleMouseDown(e: MouseEvent) {
      startX = e.clientX - initialX
      startY = e.clientY - initialY
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    function handleMouseMove(e: MouseEvent) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      
      el.style.left = `${dx}px`
      el.style.top = `${dy}px`
      
      if (binding.value?.onDrag) {
        binding.value.onDrag({ x: dx, y: dy })
      }
    }
    
    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (binding.value?.onDragEnd) {
        binding.value.onDragEnd()
      }
    }
    
    // 初始化位置
    const rect = el.getBoundingClientRect()
    initialX = rect.left
    initialY = rect.top
    
    el.addEventListener('mousedown', handleMouseDown)
  }
}

// 使用
<template>
  <div
    v-draggable="{
      onDrag: handleDrag,
      onDragEnd: handleDragEnd
    }"
  >
    Drag me!
  </div>
</template>
```

### 2. 指令组合

```ts
// 组合多个指令功能
const createComposedDirective = (...directives) => {
  return {
    mounted(el, binding) {
      directives.forEach(directive => {
        directive.mounted?.(el, binding)
      })
    },
    updated(el, binding) {
      directives.forEach(directive => {
        directive.updated?.(el, binding)
      })
    },
    unmounted(el, binding) {
      directives.forEach(directive => {
        directive.unmounted?.(el, binding)
      })
    }
  }
}

// 使用
const vEnhanced = createComposedDirective(
  vDraggable,
  vResizable,
  vTooltip
)
```

### 3. 类型安全

```ts
// 定义指令的类型
interface DraggableOptions {
  onDrag?: (position: { x: number; y: number }) => void
  onDragEnd?: () => void
}

interface DraggableHTMLElement extends HTMLElement {
  _draggable?: {
    cleanup: () => void
  }
}

const vDraggable: Directive<DraggableHTMLElement, DraggableOptions> = {
  mounted(el, binding) {
    // 实现...
  },
  unmounted(el) {
    el._draggable?.cleanup()
  }
}
```

## 最佳实践

### 1. 性能优化

```ts
// 使用防抖优化频繁更新
const vLazyUpdate = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const debounced = debounce((value) => {
      // 更新逻辑
    }, 200)
    
    el._cleanup = () => debounced.cancel()
    
    // 初始更新
    debounced(binding.value)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 防抖更新
    el._debounced?.(binding.value)
  },
  unmounted(el: HTMLElement) {
    el._cleanup?.()
  }
}
```

### 2. 资源清理

```ts
// 确保资源被正确清理
const vObserver = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const observer = new IntersectionObserver(entries => {
      // 观察逻辑
    })
    
    observer.observe(el)
    
    // 存储清理函数
    el._cleanup = () => observer.disconnect()
  },
  unmounted(el: HTMLElement) {
    // 执行清理
    el._cleanup?.()
  }
}
```

### 3. 错误处理

```ts
// 提供错误处理和降级方案
const vFeature = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    try {
      // 检查浏览器支持
      if (!('someAPI' in window)) {
        throw new Error('Browser not supported')
      }
      
      // 实现功能
    } catch (e) {
      console.warn(`v-feature directive error:`, e)
      
      // 降级处理
      if (binding.value?.fallback) {
        binding.value.fallback(el)
      }
    }
  }
}
```

## 调试技巧

### 1. 开发环境检查

```ts
// 添加开发环境检查
const createDevDirective = (directive: Directive) => {
  return {
    ...directive,
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      if (import.meta.env.DEV) {
        console.log(`Directive mounted with value:`, binding.value)
      }
      directive.mounted?.(el, binding)
    }
  }
}

// 使用
const vDebug = createDevDirective(vFeature)
```

### 2. 性能监控

```ts
// 监控指令性能
const createPerformanceDirective = (directive: Directive) => {
  return {
    ...directive,
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      if (import.meta.env.DEV) {
        console.time(`directive-${binding.arg || 'default'}`)
      }
      
      directive.mounted?.(el, binding)
      
      if (import.meta.env.DEV) {
        console.timeEnd(`directive-${binding.arg || 'default'}`)
      }
    }
  }
}
```
