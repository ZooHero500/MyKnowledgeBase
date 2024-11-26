# Vue 类与样式绑定

## 基础用法

### 对象语法

1. **基本绑定**
```vue
<template>
  <div :class="{ active: isActive }"></div>
</template>

<script setup>
import { ref } from 'vue'

const isActive = ref(true)
</script>
```

2. **多个类名**
```vue
<template>
  <div :class="{ 
    active: isActive, 
    'text-danger': hasError,
    'is-loading': loading 
  }"></div>
</template>

<script setup>
import { ref } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const loading = ref(false)
</script>
```

### 数组语法

1. **基本数组**
```vue
<template>
  <div :class="[activeClass, errorClass]"></div>
</template>

<script setup>
import { ref } from 'vue'

const activeClass = ref('active')
const errorClass = ref('text-danger')
</script>
```

2. **条件渲染**
```vue
<template>
  <div :class="[
    isActive ? activeClass : '', 
    errorClass
  ]"></div>
</template>
```

### 内联样式绑定

1. **对象语法**
```vue
<template>
  <div :style="{ 
    color: activeColor,
    fontSize: fontSize + 'px',
    backgroundColor: bgColor 
  }"></div>
</template>

<script setup>
import { ref } from 'vue'

const activeColor = ref('red')
const fontSize = ref(16)
const bgColor = ref('#f0f0f0')
</script>
```

2. **数组语法**
```vue
<template>
  <div :style="[baseStyles, overrideStyles]"></div>
</template>

<script setup>
import { ref } from 'vue'

const baseStyles = ref({
  color: 'blue',
  fontSize: '16px'
})

const overrideStyles = ref({
  backgroundColor: 'gray',
  padding: '10px'
})
</script>
```

## 高级技巧

### 1. 动态计算类名

```vue
<template>
  <div :class="computedClasses">
    Dynamic Classes
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const theme = ref('dark')
const size = ref('large')
const isActive = ref(true)

// ✨ 技巧：使用计算属性动态组合类名
const computedClasses = computed(() => {
  const classes = [`theme-${theme.value}`, `size-${size.value}`]
  
  if (isActive.value) {
    classes.push('is-active')
  }
  
  // 添加条件类名
  if (size.value === 'large') {
    classes.push('has-shadow', 'rounded-lg')
  }
  
  return classes
})
</script>

<style>
.theme-dark { /* ... */ }
.theme-light { /* ... */ }
.size-small { /* ... */ }
.size-large { /* ... */ }
.is-active { /* ... */ }
.has-shadow { /* ... */ }
.rounded-lg { /* ... */ }
</style>
```

### 2. CSS 模块与动态类名

```vue
<template>
  <div :class="$style[dynamicClassName]">
    Dynamic Module Classes
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const status = ref('success')

// ✨ 技巧：动态使用 CSS 模块类名
const dynamicClassName = computed(() => `status-${status.value}`)
</script>

<style module>
.status-success {
  color: green;
  background: #e6ffe6;
}

.status-error {
  color: red;
  background: #ffe6e6;
}

.status-warning {
  color: orange;
  background: #fff3e6;
}
</style>
```

### 3. 响应式主题切换

```vue
<template>
  <div :class="containerClasses">
    <button @click="toggleTheme">Toggle Theme</button>
    Content
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const theme = ref('light')
const userPreferences = ref({
  fontSize: 'medium',
  contrast: 'normal'
})

// ✨ 技巧：复杂的主题类组合
const containerClasses = computed(() => ({
  [`theme-${theme.value}`]: true,
  [`font-${userPreferences.value.fontSize}`]: true,
  [`contrast-${userPreferences.value.contrast}`]: true,
  'theme-transition': true
}))

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style>
/* 添加平滑过渡效果 */
.theme-transition {
  transition: all 0.3s ease;
}

.theme-light {
  --bg-color: #ffffff;
  --text-color: #333333;
}

.theme-dark {
  --bg-color: #333333;
  --text-color: #ffffff;
}

/* 字体大小变体 */
.font-small { font-size: 14px; }
.font-medium { font-size: 16px; }
.font-large { font-size: 18px; }

/* 对比度变体 */
.contrast-normal { opacity: 1; }
.contrast-high { 
  filter: contrast(1.2);
  font-weight: bold;
}
</style>
```

### 4. 条件样式合并

```vue
<template>
  <div :style="mergedStyles">
    Merged Styles
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const baseStyles = ref({
  padding: '20px',
  margin: '10px',
  transition: 'all 0.3s ease'
})

const conditionalStyles = computed(() => {
  const styles = {}
  
  // ✨ 技巧：基于条件动态添加样式
  if (window.matchMedia('(max-width: 768px)').matches) {
    Object.assign(styles, {
      padding: '10px',
      fontSize: '14px'
    })
  }
  
  // 添加浏览器特定样式
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
  if (isFirefox) {
    Object.assign(styles, {
      scrollbarWidth: 'thin',
      scrollbarColor: '#888 #f1f1f1'
    })
  }
  
  return styles
})

// 合并所有样式
const mergedStyles = computed(() => ({
  ...baseStyles.value,
  ...conditionalStyles.value
}))
</script>
```

### 5. CSS 变量绑定

```vue
<template>
  <div :style="cssVars">
    <div class="box">Dynamic CSS Variables</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const primaryColor = ref('#3498db')
const secondaryColor = ref('#2ecc71')
const spacing = ref(16)

// ✨ 技巧：使用 CSS 变量实现动态主题
const cssVars = computed(() => ({
  '--primary-color': primaryColor.value,
  '--secondary-color': secondaryColor.value,
  '--base-spacing': `${spacing.value}px`,
  '--half-spacing': `${spacing.value / 2}px`,
  '--double-spacing': `${spacing.value * 2}px`
}))
</script>

<style>
.box {
  padding: var(--base-spacing);
  margin: var(--half-spacing);
  background: var(--primary-color);
  border: 2px solid var(--secondary-color);
  box-shadow: 
    var(--half-spacing) var(--half-spacing) 
    var(--double-spacing) rgba(0,0,0,0.1);
}
</style>
```

### 6. 动态生成渐变背景

```vue
<template>
  <div :style="gradientStyle" class="gradient-box">
    Dynamic Gradient
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const gradientColors = ref(['#ff6b6b', '#4ecdc4', '#45b7d1'])
const gradientAngle = ref(45)

// ✨ 技巧：动态生成复杂的渐变背景
const gradientStyle = computed(() => {
  const colors = gradientColors.value
  const angle = gradientAngle.value
  
  // 生成渐变点
  const stops = colors.map((color, index) => {
    const percentage = (index / (colors.length - 1)) * 100
    return `${color} ${percentage}%`
  })
  
  return {
    background: `linear-gradient(${angle}deg, ${stops.join(', ')})`,
    transition: 'background 0.5s ease'
  }
})

// 动态改变渐变角度
setInterval(() => {
  gradientAngle.value = (gradientAngle.value + 1) % 360
}, 50)
</script>

<style>
.gradient-box {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
</style>
```

## 注意事项

1. **性能考虑**
   - 避免在计算属性中进行过于复杂的类名计算
   - 对于频繁变化的样式，考虑使用 CSS 变量而不是类名切换
   - 使用 `v-once` 处理不会改变的静态类名

2. **浏览器兼容性**
   - 在使用新的 CSS 特性时，确保添加适当的浏览器前缀
   - 考虑使用 PostCSS 自动处理浏览器兼容性问题

3. **最佳实践**
   - 优先使用类名而不是内联样式
   - 对于复杂的状态组合，使用计算属性而不是模板中的复杂表达式
   - 使用 CSS 变量实现主题切换，而不是切换大量的类名
