# Vue 测试方法

Vue 项目中的测试可以分为多个层次，每个层次都有其特定的测试工具和方法。本文将详细介绍 Vue 项目中的测试实践。

## 单元测试

### Vitest
Vitest 是 Vite 生态系统中的单元测试框架，它与 Vue 项目完美集成。

```js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Hello Vitest'
      }
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

### Jest
Jest 是另一个流行的测试框架，需要额外配置才能与 Vue 一起使用。

```js
import { shallowMount } from '@vue/test-utils'
import Component from './component'

test('Component', () => {
  const wrapper = shallowMount(Component)
  expect(wrapper.vm).toBeTruthy()
})
```

## 组件测试

### Vue Test Utils
Vue 官方的组件测试工具库。

```js
import { mount } from '@vue/test-utils'

test('displays message', () => {
  const wrapper = mount(MessageComponent, {
    props: {
      message: 'Hello World'
    }
  })

  // DOM 断言
  expect(wrapper.text()).toContain('Hello World')

  // 组件实例断言
  expect(wrapper.vm.message).toBe('Hello World')

  // 触发事件
  await wrapper.find('button').trigger('click')

  // 等待 DOM 更新
  await wrapper.vm.$nextTick()
})
```

### 常见测试场景

1. Props 测试
```js
test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 1
    }
  })
  expect(wrapper.props('count')).toBe(1)
})
```

2. 事件测试
```js
test('emits', async () => {
  const wrapper = mount(Component)
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('increment')).toBeTruthy()
})
```

3. Vuex/Pinia 状态测试
```js
test('store', () => {
  const store = createTestStore({
    state: {
      count: 1
    }
  })
  
  const wrapper = mount(Component, {
    global: {
      plugins: [store]
    }
  })
})
```

## 端到端测试

### Cypress
Cypress 是一个强大的端到端测试工具。

```js
describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome to Your Vue.js App')
  })

  it('clicks the button', () => {
    cy.get('button').click()
    cy.get('.count').should('have.text', '1')
  })
})
```

### Playwright
Microsoft 的现代化端到端测试工具。

```js
test('basic test', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Welcome')
  await page.click('button')
  await expect(page.locator('.count')).toHaveText('1')
})
```

## 测试最佳实践

1. **测试金字塔**
   - 单元测试（底层，数量最多）
   - 集成测试（中层）
   - 端到端测试（顶层，数量最少）

2. **测试原则**
   - 测试行为而不是实现
   - 避免测试私有方法
   - 每个测试只测试一个概念
   - 使用有意义的测试描述

3. **常见测试模式**
   - Arrange-Act-Assert (AAA)
   - Given-When-Then

4. **测试覆盖率**
   - 使用 Istanbul/c8 收集覆盖率
   - 设置合理的覆盖率目标
   - 关注核心业务逻辑的覆盖

## 调试测试

1. **Vitest UI**
```bash
npm run test:ui
```

2. **调试工具**
   - Chrome DevTools
   - VS Code Debugger
   - 浏览器开发工具

## CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

## 常见问题与解决方案

1. **异步测试**
```js
test('async operation', async () => {
  const wrapper = mount(AsyncComponent)
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('Data loaded')
})
```

2. **定时器模拟**
```js
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('timer', async () => {
  const wrapper = mount(TimerComponent)
  vi.advanceTimersByTime(1000)
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('1 second passed')
})
```

3. **网络请求模拟**
```js
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

test('api call', async () => {
  axios.get.mockResolvedValue({ data: { message: 'success' } })
  const wrapper = mount(ApiComponent)
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('success')
})
```

## 测试驱动开发 (TDD)

TDD 是一种开发方法，它要求在编写实际代码之前先编写测试。在 Vue 项目中实践 TDD 的步骤：

1. **红色**：编写一个失败的测试
```js
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

test('increments counter when button is clicked', async () => {
  const wrapper = mount(Counter)
  expect(wrapper.text()).toContain('0')
  await wrapper.find('button').trigger('click')
  expect(wrapper.text()).toContain('1')
})
```

2. **绿色**：编写最少的代码使测试通过
```vue
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

3. **重构**：改进代码，确保测试仍然通过

### TDD 最佳实践
- 保持测试简单且专注
- 遵循"红-绿-重构"循环
- 优先考虑测试用例的设计
- 持续运行测试套件

## 高级模拟和存根技术

### API 请求模拟
```js
import { mount } from '@vue/test-utils'
import axios from 'axios'
import UserList from './UserList.vue'

// 模拟 axios
vi.mock('axios')

describe('UserList', () => {
  it('fetches and displays users', async () => {
    // 设置模拟响应
    axios.get.mockResolvedValue({
      data: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]
    })

    const wrapper = mount(UserList)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(axios.get).toHaveBeenCalledWith('/api/users')
  })
})
```

### 复杂依赖注入的模拟
```js
const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: { name: 'home' }
  }
}

const wrapper = mount(Component, {
  global: {
    mocks: {
      $router: mockRouter
    }
  }
})
```

### 定时器和动画的模拟
```js
describe('AnimatedComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes animation after delay', () => {
    const wrapper = mount(AnimatedComponent)
    vi.runAllTimers()
    expect(wrapper.classes()).toContain('completed')
  })
})
```

## 快照测试

快照测试用于捕获组件渲染输出，并在后续测试中检测非预期的更改。

```js
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        message: 'Hello World'
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
```

### 快照测试最佳实践
- 仅对稳定的UI组件使用快照
- 保持快照简短且有意义
- 仔细审查快照差异
- 考虑使用内联快照进行小型测试

## 性能测试

### 组件渲染性能
```js
import { mount } from '@vue/test-utils'
import { performance } from 'perf_hooks'

describe('Performance', () => {
  it('renders large list efficiently', () => {
    const start = performance.now()
    
    const wrapper = mount(LargeList, {
      props: {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          text: `Item ${i}`
        }))
      }
    })
    
    const end = performance.now()
    expect(end - start).toBeLessThan(100) // 确保渲染时间在100ms以内
  })
})
```

### 内存泄漏测试
```js
import { mount } from '@vue/test-utils'

describe('Memory Management', () => {
  it('properly cleans up resources', async () => {
    const wrapper = mount(ResourceComponent)
    
    // 记录初始内存使用
    const initialMemory = process.memoryUsage().heapUsed
    
    // 执行可能导致内存泄漏的操作
    await wrapper.vm.loadData()
    wrapper.unmount()
    
    // 强制垃圾回收
    global.gc()
    
    // 检查内存使用是否显著增加
    const finalMemory = process.memoryUsage().heapUsed
    expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024) // 1MB
  })
})
```

## 可访问性测试

### 使用 jest-axe 进行可访问性测试
```js
import { mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const wrapper = mount(Form)
    const html = wrapper.element
    const results = await axe(html)
    expect(results).toHaveNoViolations()
  })
})
```

### 常见可访问性检查
```js
describe('Form Accessibility', () => {
  it('has proper ARIA labels', () => {
    const wrapper = mount(Form)
    const input = wrapper.find('input')
    expect(input.attributes('aria-label')).toBeDefined()
  })

  it('maintains proper tab order', () => {
    const wrapper = mount(Form)
    const elements = wrapper.findAll('[tabindex]')
    const tabIndices = elements.map(el => parseInt(el.attributes('tabindex')))
    expect(tabIndices).toEqual([...tabIndices].sort())
  })
})
