# useLayoutEffect

`useLayoutEffect` 是 React 提供的一个同步执行副作用的 Hook。它的函数签名与 `useEffect` 完全相同，但执行时机不同。

## 基本语法

```jsx
useLayoutEffect(setup, dependencies?)
```

- `setup`: 包含副作用代码的函数，可以返回一个清理函数
- `dependencies`: 可选的依赖数组

## useLayoutEffect vs useEffect

### 执行时机
- `useLayoutEffect`: 在 DOM 变更后同步触发，在浏览器执行绘制之前
- `useEffect`: 在渲染完成后异步触发，不会阻塞浏览器绘制

```jsx
function Example() {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    // 这里的代码会在 DOM 更新后同步执行
    // 浏览器绘制之前
    console.log('Layout effect:', count);
  }, [count]);

  useEffect(() => {
    // 这里的代码会在浏览器绘制后异步执行
    console.log('Effect:', count);
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 适用场景

### 1. 测量和更新 DOM
当需要在 DOM 更新后立即测量布局并进行调整时：

```jsx
function AutoHeight({ content }) {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    // 获取元素实际高度
    const height = elementRef.current.getBoundingClientRect().height;
    // 根据高度进行调整
    if (height > 100) {
      elementRef.current.style.height = '100px';
      elementRef.current.style.overflow = 'auto';
    }
  }, [content]);

  return <div ref={elementRef}>{content}</div>;
}
```

### 2. 动画处理
需要在元素出现时立即执行动画，避免闪烁：

```jsx
function SlideIn({ children }) {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    // 初始位置
    element.style.transform = 'translateX(-100%)';
    element.style.opacity = '0';
    
    // 强制浏览器重排
    element.getBoundingClientRect();

    // 设置过渡效果
    element.style.transition = 'all 0.3s ease-out';
    element.style.transform = 'translateX(0)';
    element.style.opacity = '1';

    return () => {
      element.style.transition = '';
      element.style.transform = '';
      element.style.opacity = '';
    };
  }, []);

  return <div ref={elementRef}>{children}</div>;
}
```

### 3. 工具提示定位
需要根据目标元素位置来定位工具提示：

```jsx
function Tooltip({ target, content }) {
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    const targetRect = target.getBoundingClientRect();
    
    // 计算并设置工具提示位置
    tooltip.style.top = `${targetRect.bottom + 10}px`;
    tooltip.style.left = `${targetRect.left + targetRect.width / 2}px`;
  }, [target]);

  return <div ref={tooltipRef} className="tooltip">{content}</div>;
}
```

## 最佳实践

### 1. 谨慎使用
- 优先使用 `useEffect`，除非确实需要同步执行
- 同步执行会阻塞浏览器渲染，可能影响性能

### 2. 保持简洁
```jsx
// 好的做法：只在 useLayoutEffect 中执行必要的 DOM 操作
useLayoutEffect(() => {
  const { height } = element.getBoundingClientRect();
  element.style.height = `${height * 2}px`;
}, []);

// 避免的做法：在 useLayoutEffect 中执行复杂计算
useLayoutEffect(() => {
  // 不要在这里进行复杂计算
  const result = expensiveCalculation(data);
  element.style.height = `${result}px`;
}, [data]);
```

### 3. 清理副作用
```jsx
useLayoutEffect(() => {
  const observer = new ResizeObserver(entries => {
    // 处理大小变化
  });
  
  observer.observe(elementRef.current);
  
  // 清理函数
  return () => {
    observer.disconnect();
  };
}, []);
```

## 注意事项

1. **服务器端渲染**
- 在服务器端，`useLayoutEffect` 和 `useEffect` 都不会执行
- 如果组件仅在客户端使用，可以使用动态导入避免警告：
```jsx
const ClientOnlyComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
});
```

2. **性能影响**
- 过多或复杂的 `useLayoutEffect` 会延迟页面渲染
- 考虑使用 Web Workers 处理复杂计算

3. **并发模式兼容**
- 在 React 并发模式下，确保 `useLayoutEffect` 中的操作是幂等的
- 避免在 `useLayoutEffect` 中修改状态，可能导致额外的重渲染

## TypeScript 支持

```typescript
import { useLayoutEffect, RefObject } from 'react';

interface Props {
  element: RefObject<HTMLElement>;
  onResize?: (width: number, height: number) => void;
}

function useElementSize({ element, onResize }: Props) {
  useLayoutEffect(() => {
    if (!element.current || !onResize) return;

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      onResize(width, height);
    });

    observer.observe(element.current);

    return () => observer.disconnect();
  }, [element, onResize]);
}
```

## 调试技巧

1. **使用开发者工具**
```jsx
useLayoutEffect(() => {
  console.log('Layout effect executed');
  // 使用 React DevTools 的 Profiler
  // 检查组件的渲染时间
}, []);
```

2. **性能监控**
```jsx
useLayoutEffect(() => {
  const start = performance.now();
  
  // DOM 操作
  
  const end = performance.now();
  console.log(`Layout effect took ${end - start}ms`);
}, []);