# Vue 模板语法

Vue 使用基于 HTML 的模板语法，允许开发者声明式地将数据渲染进 DOM。

## 文本插值

### 基础文本插值
使用双大括号语法 (Mustache) 进行文本插值：

```vue
<template>
  <span>Message: {{ msg }}</span>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Hello Vue!'
    }
  }
}
</script>
```

### 原始 HTML
使用 v-html 指令渲染原始 HTML：

```vue
<template>
  <div v-html="rawHtml"></div>
</template>

<script>
export default {
  data() {
    return {
      rawHtml: '<span style="color: red">This is red text</span>'
    }
  }
}
</script>
```

::: warning 注意
动态渲染 HTML 容易导致 XSS 攻击，只对可信内容使用 v-html，绝不要对用户提供的内容使用它。
:::

## 属性绑定

### 基础属性绑定
使用 v-bind 指令（可简写为 :）绑定属性：

```vue
<template>
  <!-- 完整语法 -->
  <div v-bind:id="dynamicId"></div>
  
  <!-- 缩写 -->
  <div :id="dynamicId"></div>
  
  <!-- 动态属性名 -->
  <div :[attributeName]="value"></div>
</template>
```

### 布尔属性
对于 disabled、checked 等布尔属性，它们的存在即表示 true：

```vue
<template>
  <button :disabled="isButtonDisabled">Button</button>
</template>
```

### 多值绑定
对于 style 和 class，可以绑定对象或数组：

```vue
<template>
  <!-- 类绑定 -->
  <div :class="{ active: isActive, 'text-danger': hasError }"></div>
  <div :class="[activeClass, errorClass]"></div>
  
  <!-- 样式绑定 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
  <div :style="[baseStyles, overridingStyles]"></div>
</template>
```

## 条件渲染

### v-if
条件性地渲染元素：

```vue
<template>
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else>Not A/B</div>
</template>
```

### v-show
切换元素的显示状态：

```vue
<template>
  <div v-show="isVisible">内容会被显示或隐藏</div>
</template>
```

## 列表渲染

### v-for
遍历数组或对象：

```vue
<template>
  <!-- 遍历数组 -->
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index }} - {{ item.name }}
    </li>
  </ul>
  
  <!-- 遍历对象 -->
  <ul>
    <li v-for="(value, key, index) in object" :key="key">
      {{ index }}. {{ key }}: {{ value }}
    </li>
  </ul>
</template>
```

## 事件处理

### v-on
监听 DOM 事件（可简写为 @）：

```vue
<template>
  <!-- 方法处理器 -->
  <button v-on:click="doSomething">点击</button>
  
  <!-- 内联处理器 -->
  <button @click="count++">加 1</button>
  
  <!-- 修饰符 -->
  <form @submit.prevent="onSubmit">...</form>
</template>
```

## 表单输入绑定

### v-model
在表单元素上创建双向数据绑定：

```vue
<template>
  <!-- 文本 -->
  <input v-model="message" placeholder="edit me">
  
  <!-- 复选框 -->
  <input type="checkbox" v-model="checked">
  
  <!-- 单选按钮 -->
  <input type="radio" v-model="picked" value="One">
  
  <!-- 选择框 -->
  <select v-model="selected">
    <option value="">请选择</option>
    <option v-for="option in options" :value="option.value">
      {{ option.text }}
    </option>
  </select>
</template>
```

## 插槽

### 基础插槽
使用插槽分发内容：

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot>默认内容</slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <child-component>
    <p>分发的内容</p>
  </child-component>
</template>
```

### 具名插槽
使用多个插槽：

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <child-component>
    <template v-slot:header>
      <h1>标题</h1>
    </template>
    
    <p>默认插槽内容</p>
    
    <template #footer>
      <p>页脚</p>
    </template>
  </child-component>
</template>
```

## 最佳实践

1. **命名规范**
   - 组件名使用 PascalCase
   - 事件名使用 kebab-case
   - prop 名使用 camelCase

2. **性能优化**
   - v-show vs v-if 的选择
   - key 的正确使用
   - 计算属性的合理运用

3. **安全考虑**
   - 避免直接使用 v-html
   - 对用户输入进行验证
   - 使用安全的依赖
