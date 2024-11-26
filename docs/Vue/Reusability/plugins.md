# 插件

插件是 Vue 中扩展应用功能的主要方式，它可以为应用添加全局级别的功能。

## 核心概念

### 什么是插件？

插件是一个包含 `install` 方法的对象或函数，它可以：
- 添加全局组件
- 添加全局指令
- 添加全局属性
- 添加全局方法
- 添加应用配置
- 提供依赖注入

## 最佳实践

### 1. 基础插件

```ts
// 最简单的插件
const myPlugin = {
  install(app, options) {
    // 添加全局属性
    app.config.globalProperties.$myMethod = () => {
      // 方法实现
    }
    
    // 添加全局组件
    app.component('MyComponent', {
      // 组件实现
    })
    
    // 添加全局指令
    app.directive('my-directive', {
      // 指令实现
    })
  }
}

// 使用插件
app.use(myPlugin, {
  // 配置选项
})
```

### 2. 类型安全的插件

在开发 Vue 插件时，TypeScript 的类型支持是非常重要的。一个类型安全的插件可以帮助我们在开发时:
- 获得更好的 IDE 提示
- 在编译时捕获潜在错误
- 提供更好的代码文档

让我们通过一个实际的例子来说明如何创建类型安全的插件：

```ts
// 1. 首先定义插件的配置选项接口
interface ToastOptions {
  duration?: number          // 提示显示时长
  position?: 'top' | 'bottom' | 'center'  // 提示显示位置
  theme?: 'light' | 'dark'   // 主题
}

// 2. 定义插件方法的类型
interface ToastMethod {
  success(message: string, options?: ToastOptions): void
  error(message: string, options?: ToastOptions): void
  info(message: string, options?: ToastOptions): void
}

// 3. 扩展 Vue 的类型定义
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $toast: ToastMethod  // 这样在组件中使用 this.$toast 时会有正确的类型提示
  }
}

// 4. 创建插件
const toastPlugin = {
  install(app: App, defaultOptions: ToastOptions = {}) {
    // 创建一个 toast 容器
    const toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)

    // 实现 toast 方法
    const toast: ToastMethod = {
      success(message, options) {
        showToast(message, { ...defaultOptions, ...options, type: 'success' })
      },
      error(message, options) {
        showToast(message, { ...defaultOptions, ...options, type: 'error' })
      },
      info(message, options) {
        showToast(message, { ...defaultOptions, ...options, type: 'info' })
      }
    }

    // 注册到 Vue 实例
    app.config.globalProperties.$toast = toast
  }
}

// 5. 使用插件
const app = createApp(App)
app.use(toastPlugin, {
  duration: 3000,    // 默认显示 3 秒
  position: 'top',   // 默认显示在顶部
  theme: 'light'     // 默认使用亮色主题
})
```

在组件中使用这个类型安全的插件：

```vue
<script setup lang="ts">
const showMessage = () => {
  // IDE 会提供正确的类型提示
  getCurrentInstance()?.proxy?.$toast.success('操作成功！', {
    duration: 2000,
    position: 'center'  // IDE 会提示可用的位置选项
  })
}
</script>
```

通过这种方式定义的插件有以下优势：

1. **类型安全**：
   - 所有的方法和参数都有明确的类型定义
   - IDE 可以提供准确的代码提示
   - 编译时可以捕获类型错误

2. **可配置性**：
   - 支持全局默认配置
   - 允许每次调用时覆盖配置
   - 配置选项都有类型检查

3. **可维护性**：
   - 代码结构清晰
   - 接口定义明确
   - 易于扩展新功能

4. **使用示例**：
   ```ts
   // 正确使用
   this.$toast.success('操作成功')
   this.$toast.error('操作失败', { duration: 5000 })
   
   // 类型错误，会在编译时报错
   this.$toast.success('消息', { position: 'invalid' })  // position 类型错误
   this.$toast.unknownMethod('消息')  // 方法不存在
   ```

::: tip
在开发插件时，建议总是定义好类型，这样不仅可以提供更好的开发体验，还能避免运行时的潜在错误。
:::

### 3. 提供配置

```ts
// 创建可配置的插件
const createConfigurablePlugin = (defaultOptions = {}) => {
  let currentOptions = { ...defaultOptions }
  
  return {
    install(app: App, options = {}) {
      // 合并选项
      currentOptions = {
        ...currentOptions,
        ...options
      }
      
      // 提供配置访问
      app.config.globalProperties.$pluginConfig = currentOptions
      
      // 提供更新配置的方法
      app.provide('updatePluginConfig', (newOptions) => {
        currentOptions = {
          ...currentOptions,
          ...newOptions
        }
      })
    }
  }
}

// 使用
const myPlugin = createConfigurablePlugin({
  theme: 'light',
  lang: 'en'
})

app.use(myPlugin, {
  theme: 'dark'
})
```

## 进阶技巧

### 1. 组合式函数集成

```ts
// 创建包含组合式函数的插件
const createComposablesPlugin = (composables) => {
  return {
    install(app: App) {
      // 注册所有组合式函数
      Object.entries(composables).forEach(([name, composable]) => {
        app.provide(`use${name}`, composable)
      })
      
      // 添加帮助方法
      app.config.globalProperties.$use = (name) => {
        const instance = getCurrentInstance()
        if (!instance) {
          throw new Error('$use must be called within setup')
        }
        
        return inject(`use${name}`)
      }
    }
  }
}

// 使用
const plugin = createComposablesPlugin({
  Counter: useCounter,
  Theme: useTheme,
  Auth: useAuth
})

// 在组件中使用
const counter = inject('useCounter')
// 或
const counter = this.$use('Counter')
```

### 2. 插件链

```ts
// 创建可链式调用的插件系统
const createPluginChain = () => {
  const plugins: Plugin[] = []
  
  return {
    use(plugin: Plugin, options = {}) {
      plugins.push({ plugin, options })
      return this
    },
    
    install(app: App) {
      plugins.forEach(({ plugin, options }) => {
        app.use(plugin, options)
      })
    }
  }
}

// 使用
const pluginChain = createPluginChain()
  .use(routerPlugin)
  .use(storePlugin)
  .use(i18nPlugin)

app.use(pluginChain)
```

### 3. 条件加载

```ts
// 创建条件加载的插件
const createConditionalPlugin = (condition: () => boolean) => {
  return {
    async install(app: App) {
      if (await condition()) {
        // 动态导入插件
        const { default: plugin } = await import('./heavy-plugin')
        app.use(plugin)
      } else {
        // 使用轻量级替代
        app.use(lightPlugin)
      }
    }
  }
}

// 使用
const plugin = createConditionalPlugin(
  () => window.innerWidth > 768
)
```

## 最佳实践

### 1. 模块化设计

```ts
// 将插件功能模块化
const createModularPlugin = (modules) => {
  return {
    install(app: App, options = {}) {
      // 注册每个模块
      Object.entries(modules).forEach(([name, module]) => {
        if (options[name] !== false) {
          module.install?.(app, options[name])
        }
      })
    }
  }
}

// 使用
const plugin = createModularPlugin({
  ui: UIModule,
  auth: AuthModule,
  analytics: AnalyticsModule
})

app.use(plugin, {
  ui: { theme: 'dark' },
  auth: { provider: 'oauth' },
  analytics: false // 禁用此模块
})
```

### 2. 错误处理

```ts
// 添加错误处理
const createSafePlugin = (plugin: Plugin) => {
  return {
    install(app: App, options = {}) {
      try {
        // 检查依赖
        if (options.checkDependencies) {
          const missing = checkDependencies()
          if (missing.length) {
            throw new Error(`Missing dependencies: ${missing.join(', ')}`)
          }
        }
        
        // 安装插件
        plugin.install(app, options)
      } catch (e) {
        console.error(`Plugin installation failed:`, e)
        
        // 降级处理
        if (options.fallback) {
          options.fallback(app, e)
        }
      }
    }
  }
}
```

### 3. 性能优化

```ts
// 优化插件加载性能
const createOptimizedPlugin = (plugin: Plugin) => {
  let installed = false
  
  return {
    install(app: App, options = {}) {
      // 避免重复安装
      if (installed) {
        console.warn('Plugin already installed')
        return
      }
      
      // 延迟加载非关键功能
      if (options.lazy) {
        onMounted(() => {
          plugin.install(app, options)
        })
      } else {
        plugin.install(app, options)
      }
      
      installed = true
    }
  }
}
```

## 调试技巧

### 1. 开发环境检查

```ts
// 添加开发环境调试信息
const createDevPlugin = (plugin: Plugin, name = 'Unknown') => {
  return {
    install(app: App, options = {}) {
      if (import.meta.env.DEV) {
        console.log(`Installing plugin: ${name}`)
        console.log('Options:', options)
        
        // 记录安装时间
        console.time(`Plugin: ${name}`)
        plugin.install(app, options)
        console.timeEnd(`Plugin: ${name}`)
      } else {
        plugin.install(app, options)
      }
    }
  }
}
```

### 2. 状态追踪

```ts
// 追踪插件状态
const createTrackedPlugin = (plugin: Plugin) => {
  const state = reactive({
    installed: false,
    error: null,
    installTime: 0
  })
  
  return {
    install(app: App, options = {}) {
      const startTime = performance.now()
      
      try {
        plugin.install(app, options)
        state.installed = true
      } catch (e) {
        state.error = e
        throw e
      } finally {
        state.installTime = performance.now() - startTime
      }
    },
    
    // 暴露状态
    state: readonly(state)
  }
}
