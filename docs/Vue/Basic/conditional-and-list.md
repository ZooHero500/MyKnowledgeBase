# 条件渲染与列表渲染

## 条件渲染基础

### v-if 指令

`v-if` 是最基本的条件渲染指令，用于根据表达式的真假值来有条件地渲染元素。

```vue
<template>
  <div>
    <h1 v-if="isLoggedIn">欢迎回来</h1>
    <h1 v-else>请登录</h1>

    <!-- 多条件判断 -->
    <div v-if="type === 'A'">A 类型内容</div>
    <div v-else-if="type === 'B'">B 类型内容</div>
    <div v-else-if="type === 'C'">C 类型内容</div>
    <div v-else>默认内容</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoggedIn = ref(false)
const type = ref('A')
</script>
```

### v-show 指令

`v-show` 与 `v-if` 类似，但是它只是切换元素的 CSS `display` 属性。

```vue
<template>
  <div>
    <!-- 频繁切换使用 v-show -->
    <div v-show="isVisible">这个元素会频繁切换显示状态</div>
    
    <!-- 条件很少改变使用 v-if -->
    <div v-if="isAdmin">这个元素很少改变状态</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
const isAdmin = ref(false)
</script>
```

### v-if vs v-show 性能对比

```vue
<template>
  <div>
    <!-- 性能测试组件 -->
    <button @click="toggleAll">Toggle All</button>
    
    <div v-for="i in 1000" :key="i">
      <!-- v-if 版本 -->
      <div v-if="showIf">
        Heavy content with v-if
      </div>
      
      <!-- v-show 版本 -->
      <div v-show="showShow">
        Heavy content with v-show
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showIf = ref(true)
const showShow = ref(true)

// 使用 performance.now() 测量切换时间
function toggleAll() {
  const start = performance.now()
  showIf.value = !showIf.value
  const ifTime = performance.now() - start
  
  const start2 = performance.now()
  showShow.value = !showShow.value
  const showTime = performance.now() - start2
  
  console.log(`v-if toggle time: ${ifTime}ms`)
  console.log(`v-show toggle time: ${showTime}ms`)
}
</script>
```

## 列表渲染基础

### v-for 基本用法

```vue
<template>
  <div>
    <!-- 基本数组遍历 -->
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        {{ index }}. {{ item.name }}
      </li>
    </ul>

    <!-- 对象属性遍历 -->
    <div v-for="(value, key, index) in object" :key="key">
      {{ index }}. {{ key }}: {{ value }}
    </div>

    <!-- 范围遍历 -->
    <span v-for="n in 10" :key="n">{{ n }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '项目 1' },
  { id: 2, name: '项目 2' },
  { id: 3, name: '项目 3' }
])

const object = ref({
  title: '标题',
  author: '作者',
  year: 2024
})
</script>
```

## 高级技巧与性能优化

### 1. 条件渲染优化

```vue
<template>
  <div>
    <!-- 使用 template 包裹多个元素 -->
    <template v-if="showGroup">
      <header>标题</header>
      <main>内容</main>
      <footer>页脚</footer>
    </template>

    <!-- 使用计算属性优化复杂条件 -->
    <div v-if="shouldShowContent">
      复杂条件判断的内容
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showGroup = ref(true)
const userRole = ref('admin')
const isLoggedIn = ref(true)
const hasPermission = ref(true)

// 使用计算属性处理复杂条件
const shouldShowContent = computed(() => {
  return isLoggedIn.value && 
         (userRole.value === 'admin' || hasPermission.value)
})
</script>
```

### 2. 列表渲染优化

#### 就地更新策略

```vue
<template>
  <div>
    <!-- ❌ 不推荐：使用索引作为 key -->
    <div v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </div>

    <!-- ✅ 推荐：使用唯一标识作为 key -->
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: '项目 1' },
  { id: 2, name: '项目 2' }
])

// 演示就地更新的影响
function shuffleItems() {
  items.value = items.value.sort(() => Math.random() - 0.5)
}
</script>
```

#### 虚拟列表优化

```vue
<template>
  <div>
    <!-- 使用虚拟滚动组件 -->
    <virtual-list
      :items="largeList"
      :item-height="50"
      :visible-items="10"
    >
      <template #default="{ item }">
        <div class="list-item">{{ item.name }}</div>
      </template>
    </virtual-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from './VirtualList.vue'

// 生成大量数据
const largeList = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `项目 ${i}`
  }))
)
</script>

<!-- VirtualList.vue -->
<template>
  <div
    class="virtual-list"
    :style="{ height: totalHeight + 'px' }"
    @scroll="onScroll"
  >
    <div
      class="virtual-list-inner"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    required: true
  },
  visibleItems: {
    type: Number,
    required: true
  }
})

const scrollTop = ref(0)

// 计算总高度
const totalHeight = computed(() => 
  props.items.length * props.itemHeight
)

// 计算偏移量
const offsetY = computed(() => 
  Math.floor(scrollTop.value / props.itemHeight) * props.itemHeight
)

// 计算可见项目
const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = start + props.visibleItems
  return props.items.slice(start, end)
})

function onScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>

<style scoped>
.virtual-list {
  overflow-y: auto;
  position: relative;
}

.virtual-list-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
```

### 3. 组合条件和列表渲染

```vue
<template>
  <div>
    <!-- 筛选和排序 -->
    <div class="filters">
      <input v-model="searchQuery" placeholder="搜索...">
      <select v-model="sortBy">
        <option value="name">按名称</option>
        <option value="date">按日期</option>
      </select>
    </div>

    <!-- 组合使用条件和列表渲染 -->
    <ul>
      <template v-for="group in filteredAndSortedItems" :key="group.date">
        <li v-if="group.items.length" class="group-header">
          {{ group.date }}
        </li>
        <li
          v-for="item in group.items"
          :key="item.id"
          class="group-item"
        >
          {{ item.name }}
        </li>
        <li v-if="group.items.length === 0" class="empty-group">
          该组没有数据
        </li>
      </template>
    </ul>

    <!-- 空状态处理 -->
    <div v-if="!filteredAndSortedItems.length" class="empty-state">
      没有找到匹配的数据
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: '任务 1', date: '2024-01-01', completed: false },
  { id: 2, name: '任务 2', date: '2024-01-01', completed: true },
  { id: 3, name: '任务 3', date: '2024-01-02', completed: false }
])

const searchQuery = ref('')
const sortBy = ref('date')

// 复杂的数据处理逻辑
const filteredAndSortedItems = computed(() => {
  // 1. 首先过滤
  const filtered = items.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // 2. 按日期分组
  const grouped = filtered.reduce((groups, item) => {
    const date = item.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {})

  // 3. 转换为数组并排序
  return Object.entries(grouped)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => {
      if (sortBy.value === 'date') {
        return new Date(b.date) - new Date(a.date)
      }
      // 按名称排序时，使用第一个项目的名称
      return a.items[0]?.name.localeCompare(b.items[0]?.name)
    })
})
</script>

<style scoped>
.filters {
  margin-bottom: 20px;
}

.group-header {
  font-weight: bold;
  margin-top: 10px;
}

.group-item {
  margin-left: 20px;
}

.empty-group {
  color: #999;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
```

## 最佳实践总结

### 条件渲染最佳实践

1. **选择合适的条件渲染方式**
   - 频繁切换的元素使用 `v-show`
   - 条件很少改变的元素使用 `v-if`
   - 需要控制多个元素时使用 `template` 标签

2. **优化条件判断**
   - 复杂条件使用计算属性
   - 避免在模板中写复杂的条件表达式
   - 考虑使用策略模式替代复杂的条件判断

### 列表渲染最佳实践

1. **key 的正确使用**
   - 始终为 `v-for` 提供唯一的 `key`
   - 避免使用索引作为 `key`
   - 确保 `key` 的稳定性

2. **性能优化**
   - 大量数据使用虚拟滚动
   - 避免同时使用 `v-if` 和 `v-for`
   - 使用计算属性进行列表过滤和排序

3. **数据处理**
   - 在计算属性中处理复杂的数据转换
   - 使用 `watchEffect` 处理副作用
   - 适当的数据分页和懒加载

### 调试技巧

1. **Vue DevTools**
   - 使用 Vue DevTools 检查组件层级
   - 监控组件的重新渲染
   - 观察响应式数据的变化

2. **性能分析**
   - 使用 Chrome Performance 面板分析渲染性能
   - 监控内存使用情况
   - 使用 Vue 的性能追踪功能

3. **错误处理**
   - 为列表渲染添加错误边界
   - 处理空状态和加载状态
   - 添加适当的错误提示
