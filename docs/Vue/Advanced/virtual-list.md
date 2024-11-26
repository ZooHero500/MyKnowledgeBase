# 虚拟列表

## 概念
虚拟列表是一种优化大量数据渲染的技术。只渲染可视区域内的数据，其他数据用空白占位。

## 原理
1. 计算可视区域能显示的数据条数
2. 根据滚动位置计算应该显示哪些数据
3. 只渲染这部分数据
4. 用 transform 调整元素位置

## 基础实现

```vue
<template>
  <div class="virtual-list" @scroll="onScroll" ref="listRef">
    <!-- 用于撑开滚动条 -->
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }" />
    
    <!-- 真实显示的数据 -->
    <div class="virtual-list-content" :style="{ transform: `translate3d(0, ${offset}px, 0)` }">
      <div v-for="item in visibleData" :key="item.id" :style="{ height: itemHeight + 'px' }">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // 列表数据
  listData: {
    type: Array,
    default: () => []
  },
  // 每项高度
  itemHeight: {
    type: Number,
    default: 50
  },
  // 可视区域高度
  visibleHeight: {
    type: Number,
    default: 400
  }
})

const listRef = ref(null)
const scrollTop = ref(0)

// 可显示的数据条数
const visibleCount = computed(() => 
  Math.ceil(props.visibleHeight / props.itemHeight)
)

// 数据总高度
const totalHeight = computed(() => 
  props.listData.length * props.itemHeight
)

// 起始索引
const startIndex = computed(() => 
  Math.floor(scrollTop.value / props.itemHeight)
)

// 结束索引
const endIndex = computed(() => 
  Math.min(startIndex.value + visibleCount.value, props.listData.length)
)

// 偏移量
const offset = computed(() => 
  startIndex.value * props.itemHeight
)

// 实际显示的数据
const visibleData = computed(() => 
  props.listData.slice(startIndex.value, endIndex.value)
)

// 滚动事件处理
const onScroll = () => {
  scrollTop.value = listRef.value.scrollTop
}
</script>

<style>
.virtual-list {
  height: 400px;
  overflow: auto;
  position: relative;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
```

## 使用示例

```vue
<template>
  <virtual-list
    :list-data="listData"
    :item-height="50"
    :visible-height="400"
  />
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from './VirtualList.vue'

// 生成测试数据
const listData = ref(
  Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    text: `Item ${index}`
  }))
)
</script>
```

## 优化版本

### 1. 缓冲区
增加上下缓冲区，避免快速滚动时白屏：

```js
const bufferSize = 5 // 上下各多渲染 5 条

const startIndex = computed(() => 
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - bufferSize)
)

const endIndex = computed(() => 
  Math.min(
    startIndex.value + visibleCount.value + bufferSize * 2,
    props.listData.length
  )
)
```

### 2. 动态高度
支持不同高度的列表项：

```vue
<template>
  <div class="virtual-list" @scroll="onScroll" ref="listRef">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }" />
    <div class="virtual-list-content" :style="{ transform: `translate3d(0, ${offset}px, 0)` }">
      <div
        v-for="item in visibleData"
        :key="item.id"
        :style="{ height: itemHeights[item.id] + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
// 存储每项的高度
const itemHeights = ref({})

// 计算位置时使用实际高度
const getItemOffset = (index) => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += itemHeights.value[i] || props.itemHeight
  }
  return offset
}

// 更新项高度
const updateItemHeight = (id, height) => {
  itemHeights.value[id] = height
}
</script>
```

### 3. 无限加载
结合虚拟列表实现无限加载：

```vue
<script setup>
const loading = ref(false)
const hasMore = ref(true)

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const newData = await fetchData()
    listData.value.push(...newData)
    hasMore.value = newData.length > 0
  } finally {
    loading.value = false
  }
}

// 监听滚动到底部
const onScroll = () => {
  scrollTop.value = listRef.value.scrollTop
  
  // 距离底部 20px 时加载更多
  const bottom = scrollTop.value + props.visibleHeight
  if (bottom + 20 >= totalHeight.value) {
    loadMore()
  }
}
</script>
```
