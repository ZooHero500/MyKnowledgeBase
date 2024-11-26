# Vue 生产部署最佳实践

本文将介绍 Vue 应用的生产部署最佳实践，包括构建优化、部署策略和性能监控等方面。

## 1. 构建优化

### 1.1 代码分割

使用动态导入实现按需加载：

```js
// router.js
const routes = [
  {
    path: '/dashboard',
    // 路由级代码分割
    component: () => import('./views/Dashboard.vue'),
    // 指定 chunk 名称
    chunkName: 'dashboard'
  }
]
```

对于大型组件库，使用按需导入：

```js
// 按需导入组件
import { Button, Table } from 'element-plus'
// 按需导入样式
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/table/style/css'
```

### 1.2 资源优化

使用 Vite 的构建优化功能：

```js
// vite.config.js
export default defineConfig({
  build: {
    // 启用 gzip 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 分割代码块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus']
        }
      }
    }
  }
})
```

图片资源优化：

```vue
<template>
  <!-- 使用响应式图片 -->
  <img
    :src="imgUrl"
    :srcset="imgSrcSet"
    sizes="(max-width: 600px) 100vw, 600px"
    loading="lazy"
  >
</template>

<script setup>
const imgUrl = '/images/hero.jpg'
const imgSrcSet = '/images/hero-300.jpg 300w, /images/hero-600.jpg 600w'
</script>
```

### 1.3 预加载和预获取

在 HTML 中添加资源提示：

```html
<head>
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/roboto.woff2" as="font" crossorigin>
  
  <!-- 预获取可能需要的资源 -->
  <link rel="prefetch" href="/assets/dashboard.js">
</head>
```

## 2. 部署策略

### 2.1 环境配置

使用环境变量管理不同环境的配置：

```js
// .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_SOCKET_URL=wss://ws.production.com

// .env.staging
VITE_API_BASE_URL=https://api.staging.com
VITE_SOCKET_URL=wss://ws.staging.com
```

在代码中使用：

```js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000
})
```

## 3. 性能监控

### 3.1 性能指标收集

在 Vue 项目中，我们需要重点关注以下几个方面的性能指标：

#### 1. 页面加载性能

这部分主要关注用户首次访问页面时的体验：

```js
// 在 main.js 或专门的性能监控文件中
export function trackPageLoadPerformance() {
  // 等待页面完全加载
  window.addEventListener('load', () => {
    // 获取关键时间点
    const timing = performance.getEntriesByType('navigation')[0];
    
    // 计算关键指标
    const metrics = {
      // DNS 查询时间：通常应小于 100ms
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      
      // 首次内容渲染时间：建议控制在 2s 以内
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      
      // 页面可交互时间：建议控制在 3s 以内
      tti: timing.domInteractive - timing.navigationStart,
      
      // 页面完全加载时间：建议控制在 5s 以内
      loadComplete: timing.loadEventEnd - timing.navigationStart
    };

    // 举例：判断性能是否达标
    const performanceScore = {
      dns: metrics.dns < 100 ? 'good' : 'poor',
      fcp: metrics.fcp < 2000 ? 'good' : 'poor',
      tti: metrics.tti < 3000 ? 'good' : 'poor',
      loadComplete: metrics.loadComplete < 5000 ? 'good' : 'poor'
    };

    // 发送到性能监控平台
    sendToAnalytics('page_load', metrics);
    
    // 如果性能不达标，在控制台输出警告
    Object.entries(performanceScore).forEach(([metric, score]) => {
      if (score === 'poor') {
        console.warn(`性能警告: ${metric} 指标不达标`);
      }
    });
  });
}
```

#### 2. 组件渲染性能

监控具体组件的渲染性能，特别是列表或频繁更新的组件：

```js
// 创建一个性能监控 mixin
const performanceMixin = {
  beforeCreate() {
    this._componentStartTime = performance.now();
  },
  
  mounted() {
    const renderTime = performance.now() - this._componentStartTime;
    
    // 如果组件渲染时间超过 100ms，记录警告
    if (renderTime > 100) {
      console.warn(`组件 ${this.$options.name} 首次渲染时间过长: ${renderTime.toFixed(2)}ms`);
      
      // 记录慢渲染的组件
      sendToAnalytics('slow_component', {
        component: this.$options.name,
        renderTime,
        // 记录组件的 props 和 data 大小，帮助排查问题
        propsSize: JSON.stringify(this.$props).length,
        dataSize: JSON.stringify(this.$data).length
      });
    }
  },
  
  beforeUpdate() {
    this._updateStartTime = performance.now();
  },
  
  updated() {
    const updateTime = performance.now() - this._updateStartTime;
    
    // 如果更新时间超过 50ms，记录警告
    if (updateTime > 50) {
      console.warn(`组件 ${this.$options.name} 更新时间过长: ${updateTime.toFixed(2)}ms`);
      
      // 对于更新慢的组件，建议使用虚拟滚动或分页
      sendToAnalytics('slow_update', {
        component: this.$options.name,
        updateTime
      });
    }
  }
};

// 在 main.js 中使用
app.mixin(performanceMixin);
```

#### 3. 用户交互响应时间

监控按钮点击、表单提交等用户交互的响应时间：

```js
// 在 main.js 或专门的性能监控文件中
export function trackUserInteractions() {
  // 监控点击响应时间
  document.addEventListener('click', e => {
    if (e.target.matches('button, .btn')) {
      const startTime = performance.now();
      
      // 使用 requestAnimationFrame 来确保捕获到 DOM 更新后的时间
      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;
        
        // 如果响应时间超过 100ms，记录下来
        if (responseTime > 100) {
          console.warn(`按钮点击响应时间过长: ${responseTime.toFixed(2)}ms`);
          
          sendToAnalytics('slow_interaction', {
            type: 'click',
            target: e.target.textContent,
            responseTime
          });
        }
      });
    }
  });

  // 监控表单提交
  document.addEventListener('submit', e => {
    if (e.target.matches('form')) {
      const startTime = performance.now();
      
      // 记录表单提交时间
      sendToAnalytics('form_submit', {
        formId: e.target.id,
        startTime
      });
      
      // 监控表单提交后的响应时间
      const checkResponse = setInterval(() => {
        // 假设表单提交后会显示一个结果消息
        const resultElement = document.querySelector('.form-result');
        if (resultElement) {
          clearInterval(checkResponse);
          const responseTime = performance.now() - startTime;
          
          sendToAnalytics('form_complete', {
            formId: e.target.id,
            responseTime
          });
        }
      }, 100);
    }
  });
}
```

#### 4. 资源加载性能

监控图片、JS、CSS 等资源的加载情况：

```js
// 在 main.js 或专门的性能监控文件中
export function trackResourceLoading() {
  // 观察资源加载性能
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      // 只关注大文件
      if (entry.transferSize > 500000) { // 500KB
        console.warn(`大文件加载警告: ${entry.name} (${(entry.transferSize / 1024 / 1024).toFixed(2)}MB)`);
        
        sendToAnalytics('large_resource', {
          name: entry.name,
          type: entry.initiatorType,
          size: entry.transferSize,
          duration: entry.duration
        });
      }
      
      // 如果资源加载时间过长
      if (entry.duration > 2000) { // 2秒
        console.warn(`资源加载时间过长: ${entry.name} (${(entry.duration / 1000).toFixed(2)}s)`);
        
        sendToAnalytics('slow_resource', {
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration
        });
      }
    });
  });

  // 开始观察资源加载
  observer.observe({ entryTypes: ['resource'] });
}
```

#### 使用示例

在 Vue 项目中集成这些性能监控：

```js
// performance-monitoring.js
import { 
  trackPageLoadPerformance,
  trackUserInteractions,
  trackResourceLoading
} from './performance';

export function setupPerformanceMonitoring() {
  // 只在生产环境开启性能监控
  if (process.env.NODE_ENV === 'production') {
    // 初始化性能监控
    trackPageLoadPerformance();
    trackUserInteractions();
    trackResourceLoading();
    
    // 定期收集内存使用情况
    setInterval(() => {
      if (performance.memory) {
        sendToAnalytics('memory_usage', {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        });
      }
    }, 60000); // 每分钟收集一次
    
    // 监控路由切换性能
    router.beforeEach((to, from, next) => {
      window._routeStartTime = performance.now();
      next();
    });
    
    router.afterEach(() => {
      const routeTime = performance.now() - window._routeStartTime;
      if (routeTime > 500) { // 如果路由切换超过 500ms
        console.warn(`路由切换时间过长: ${routeTime.toFixed(2)}ms`);
        sendToAnalytics('slow_route_change', {
          duration: routeTime
        });
      }
    });
  }
}
```

通过这些监控，我们可以：
1. 及时发现性能问题（慢组件、慢路由、大文件）
2. 获取用户实际体验数据（页面加载时间、交互响应时间）
3. 针对性能问题进行优化（代码分割、懒加载、虚拟滚动）
4. 设置性能预算和警告阈值

建议将收集到的性能数据发送到专门的性能监控平台（如 Google Analytics、New Relic 或自建系统），并设置适当的告警阈值，当性能指标超过阈值时及时通知开发团队。

## 4. 安全考虑

### 4.1 XSS 防护

使用 CSP 策略：

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
">
```

### 4.2 敏感信息处理

```js
// 避免在前端存储敏感信息
const sensitiveData = {
  token: '***',
  userInfo: {
    // 过滤敏感字段
    ...user,
    password: undefined,
    creditCard: undefined
  }
}
```

## 5. 部署检查清单

### 5.1 构建前检查

- 移除所有 console.log 和 debugger 语句
- 确认所有环境变量都已正确设置
- 检查依赖项是否都是最新的稳定版本
- 运行所有测试用例

### 5.2 构建后检查

- 验证打包后的文件大小是否合理
- 检查是否正确生成 sourcemap
- 确认静态资源是否都已正确打包
- 验证所有路由是否都能正常访问

### 5.3 部署后检查

- 验证 API 接口是否正常工作
- 检查 CDN 缓存是否正确配置
- 确认 SSL 证书是否有效
- 验证错误监控和性能监控是否正常工作
