# useMemo

## useMemo 的作用 / 解决了什么问题？

useMemo 是 React 的一个性能优化 Hook，主要用于解决以下问题：

1. **避免重复计算**
   - 对于计算量大的操作，避免在每次渲染时都重新计算
   - 缓存计算结果，只在依赖项变化时重新计算

2. **防止不必要的渲染**
   - 对于复杂对象或数组，避免每次渲染都创建新的引用
   - 特别是当这些值被用作子组件的 props 时

## useMemo 基本用法

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 基本语法说明

1. **第一个参数**：工厂函数，返回需要缓存的值
2. **第二个参数**：依赖项数组，只有依赖项变化时才重新计算

## 使用场景

### 1. 复杂计算优化

```jsx
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 复杂的过滤逻辑
      return product.price > filter.minPrice &&
             product.price < filter.maxPrice &&
             product.category === filter.category &&
             product.name.includes(filter.searchText);
    }).sort((a, b) => b.price - a.price); // 按价格排序
  }, [products, filter]);

  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
```

#### 使用 useMemo 的效果
- 过滤和排序的结果被缓存，只在 products 或 filter 变化时重新计算
- 当组件因其他状态变化重新渲染时，不会重复执行昂贵的计算
- 在大数据集和复杂计算场景下，可以显著提升性能
- 用户界面更流畅，没有明显的卡顿

#### 不使用 useMemo 的后果
```jsx
function ProductList({ products, filter }) {
  // 每次渲染都会重新计算
  const filteredProducts = products
    .filter(product => {
      return product.price > filter.minPrice &&
             product.price < filter.maxPrice &&
             product.category === filter.category &&
             product.name.includes(filter.searchText);
    })
    .sort((a, b) => b.price - a.price);

  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
```
- 每次组件重新渲染都会重新执行过滤和排序
- 在产品列表较大时，可能导致明显的性能问题
- 即使 filter 条件没有变化，也会重复计算
- 可能导致用户界面卡顿，特别是在处理大量数据时

### 2. 引用相等性优化

```jsx
function ChartComponent({ data, config }) {
  const memoizedConfig = useMemo(() => ({
    type: 'line',
    options: {
      responsive: true,
      scales: config.scales,
      animations: config.animations,
      plugins: {
        tooltip: config.tooltip,
        legend: config.legend
      }
    }
  }), [config.scales, config.animations, config.tooltip, config.legend]);

  return (
    <Chart
      data={data}
      config={memoizedConfig}
    />
  );
}
```

#### 使用 useMemo 的效果
- 配置对象的引用保持稳定，只在相关配置真正变化时才更新
- 避免子组件（Chart）不必要的重新渲染
- 特别适合用于配置复杂的第三方组件
- 提升图表等重型组件的渲染性能

#### 不使用 useMemo 的后果
```jsx
function ChartComponent({ data, config }) {
  // 每次渲染都创建新的配置对象
  const chartConfig = {
    type: 'line',
    options: {
      responsive: true,
      scales: config.scales,
      animations: config.animations,
      plugins: {
        tooltip: config.tooltip,
        legend: config.legend
      }
    }
  };

  return (
    <Chart
      data={data}
      config={chartConfig}
    />
  );
}
```
- 每次渲染都创建新的配置对象，即使配置内容没有变化
- 导致 Chart 组件不必要的重新渲染
- 可能触发图表的重新计算和动画
- 在复杂的数据可视化场景下性能影响明显

### 3. 大型列表渲染优化

```jsx
function VirtualizedList({ items, filterText }) {
  const filteredItems = useMemo(() => {
    console.log('Computing filtered items');
    return items
      .filter(item => item.text.toLowerCase().includes(filterText.toLowerCase()))
      .map(item => ({
        ...item,
        highlight: getHighlightRanges(item.text, filterText)
      }));
  }, [items, filterText]);

  return (
    <VirtualScroller
      items={filteredItems}
      itemHeight={50}
      renderItem={({ item }) => (
        <ListItem
          key={item.id}
          text={item.text}
          highlights={item.highlight}
        />
      )}
    />
  );
}
```

#### 使用 useMemo 的效果
- 过滤和高亮计算的结果被缓存，只在数据或过滤条件变化时重新计算
- 虚拟滚动的性能得到优化，滚动更流畅
- 避免在滚动时重新计算过滤和高亮
- 大幅提升用户体验，特别是在处理长列表时

#### 不使用 useMemo 的后果
```jsx
function VirtualizedList({ items, filterText }) {
  // 每次渲染都重新计算过滤和高亮
  const filteredItems = items
    .filter(item => item.text.toLowerCase().includes(filterText.toLowerCase()))
    .map(item => ({
      ...item,
      highlight: getHighlightRanges(item.text, filterText)
    }));

  return (
    <VirtualScroller
      items={filteredItems}
      itemHeight={50}
      renderItem={({ item }) => (
        <ListItem
          key={item.id}
          text={item.text}
          highlights={item.highlight}
        />
      )}
    />
  );
}
```
- 每次滚动或其他状态更新都会重新计算过滤和高亮
- 可能导致滚动卡顿和性能问题
- 在列表项较多时，用户体验显著下降
- CPU 使用率升高，可能影响设备电池寿命

### 4. 动态样式计算

```jsx
function DynamicThemeComponent({ theme, dimensions }) {
  const styles = useMemo(() => ({
    container: {
      background: theme.background,
      padding: `${dimensions.spacing}px`,
      borderRadius: theme.borderRadius,
      boxShadow: `0 ${dimensions.elevation}px ${dimensions.elevation * 2}px ${theme.shadowColor}`,
      transform: `scale(${dimensions.scale})`,
      transition: 'all 0.3s ease'
    },
    content: {
      color: theme.textColor,
      fontSize: `${dimensions.fontSize}px`,
      lineHeight: dimensions.lineHeight
    }
  }), [theme, dimensions]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        Dynamic Themed Content
      </div>
    </div>
  );
}
```

#### 使用 useMemo 的效果
- 样式对象只在主题或尺寸变化时重新计算
- 避免不必要的样式重新计算和 DOM 更新
- 动画和过渡效果更流畅
- 减少浏览器重排和重绘的次数

#### 不使用 useMemo 的后果
```jsx
function DynamicThemeComponent({ theme, dimensions }) {
  // 每次渲染都重新创建样式对象
  const styles = {
    container: {
      background: theme.background,
      padding: `${dimensions.spacing}px`,
      borderRadius: theme.borderRadius,
      boxShadow: `0 ${dimensions.elevation}px ${dimensions.elevation * 2}px ${theme.shadowColor}`,
      transform: `scale(${dimensions.scale})`,
      transition: 'all 0.3s ease'
    },
    content: {
      color: theme.textColor,
      fontSize: `${dimensions.fontSize}px`,
      lineHeight: dimensions.lineHeight
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        Dynamic Themed Content
      </div>
    </div>
  );
}
```
- 每次渲染都创建新的样式对象
- 可能触发不必要的 DOM 更新
- 在动画过程中可能出现卡顿
- 影响复杂布局的性能表现

## 使用注意事项

1. **不要过度使用**
   - useMemo 本身也有性能开销
   - 只在确实需要优化的地方使用
   - 对于简单的计算，使用 useMemo 可能会适得其反

2. **正确设置依赖项**
   - 依赖项数组必须包含所有在回调函数中使用的外部变量
   - 避免遗漏依赖项，这可能导致bug
   - 考虑使用 ESLint 的 exhaustive-deps 规则

3. **避免过早优化**
   - 先编写正常工作的代码
   - 在发现性能问题时再考虑使用 useMemo
   - 使用性能测试工具验证优化效果

## 性能优化最佳实践

1. **合理的使用时机**
   ```jsx
   // 好的使用场景
   const expensiveValue = useMemo(() => {
     return someVeryExpensiveOperation(props.data);
   }, [props.data]);

   // 不必要的使用场景
   const simpleValue = useMemo(() => props.value * 2, [props.value]); // 过度优化
   ```

2. **结合 React.memo**
   ```jsx
   const MemoizedChild = React.memo(function Child({ data }) {
     return <div>{data.value}</div>;
   });

   function Parent() {
     const memoizedData = useMemo(() => ({
       value: 'expensive computation'
     }), []);

     return <MemoizedChild data={memoizedData} />;
   }
   ```

## 与其他 Hooks 的对比

1. **vs useCallback**
   - useMemo：缓存计算结果
   - useCallback：缓存函数引用
   ```jsx
   // useMemo 缓存值
   const value = useMemo(() => computeValue(a, b), [a, b]);
   
   // useCallback 缓存函数
   const handler = useCallback(() => doSomething(a, b), [a, b]);
   ```

2. **vs useState**
   - useMemo：用于复杂计算的缓存
   - useState：用于组件状态管理
   ```jsx
   // useState 用于简单状态
   const [count, setCount] = useState(0);
   
   // useMemo 用于复杂计算
   const expensiveCount = useMemo(() => 
     calculateExpensiveValue(count), [count]);
   ```

## 实现原理

useMemo 的核心实现原理基于以下几点：

1. **依赖项比较**
   - 使用 Object.is 比较新旧依赖项
   - 只有当依赖项变化时才重新执行工厂函数

2. **缓存机制**
   - 在 Fiber 节点上维护一个缓存
   - 缓存包含上一次的计算结果和依赖项

3. **基本实现示意**
```javascript
function useMemo(factory, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  if (hook.memoizedState !== null) {
    // 有缓存时，比较依赖项
    if (nextDeps !== null) {
      const prevDeps = hook.memoizedState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return hook.memoizedState[0];
      }
    }
  }
  
  // 计算新值并缓存
  const nextValue = factory();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}