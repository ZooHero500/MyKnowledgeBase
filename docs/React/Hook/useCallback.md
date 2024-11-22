# useCallback

## useCallback 的作用 / 解决了什么问题？

useCallback 是 React 的性能优化 Hook，主要用于解决以下问题：

1. **防止函数重新创建**
   - 在组件重新渲染时，避免重新创建函数
   - 特别是当这些函数作为 props 传递给子组件时

2. **优化子组件渲染**
   - 配合 React.memo 使用
   - 避免子组件不必要的重新渲染

## useCallback 基本用法

```jsx
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

### 基本语法说明

1. **第一个参数**：要缓存的回调函数
2. **第二个参数**：依赖项数组，只有依赖项变化时才会重新创建函数

## 使用场景

### 1. 优化子组件渲染

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 缓存回调函数
  const handleClick = useCallback(() => {
    console.log('Button clicked');
    setCount(c => c + 1);
  }, []); // 空依赖数组，因为函数不依赖任何外部变量

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ExpensiveChild onButtonClick={handleClick} />
      <div>Count: {count}</div>
    </div>
  );
}

// 使用 React.memo 包裹子组件
const ExpensiveChild = React.memo(function ExpensiveChild({ onButtonClick }) {
  console.log('ExpensiveChild rendered');
  return <button onClick={onButtonClick}>Click me</button>;
});
```

#### 使用 useCallback 的效果
- 当父组件因为 `text` 状态改变而重新渲染时，`handleClick` 函数保持不变
- `ExpensiveChild` 组件不会重新渲染，因为它的 props（`onButtonClick`）没有改变
- 在复杂组件树中可以显著提升性能

#### 不使用 useCallback 的后果
```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 每次渲染都会创建新的函数引用
  const handleClick = () => {
    console.log('Button clicked');
    setCount(c => c + 1);
  };

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ExpensiveChild onButtonClick={handleClick} />
      <div>Count: {count}</div>
    </div>
  );
}
```
- 每次父组件重新渲染，都会创建新的 `handleClick` 函数
- 即使使用了 `React.memo`，`ExpensiveChild` 也会重新渲染，因为每次收到的都是新的函数引用
- 在组件树复杂或渲染开销大的情况下，可能导致性能问题

### 2. 在 useEffect 中使用的函数

```jsx
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // 缓存搜索函数
  const searchAPI = useCallback(async (searchQuery) => {
    const response = await fetch(`/api/search?q=${searchQuery}`);
    return response.json();
  }, []); // 空依赖数组，因为搜索逻辑不变

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        const data = await searchAPI(query);
        setResults(data);
      }
    };
    fetchResults();
  }, [query, searchAPI]); // 包含 searchAPI 作为依赖项

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### 使用 useCallback 的效果
- `searchAPI` 函数只会创建一次，并在组件的整个生命周期中保持稳定
- `useEffect` 的依赖项不会因为函数引用变化而触发额外的副作用执行
- 避免了不必要的 API 调用和状态更新

#### 不使用 useCallback 的后果
```jsx
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // 每次渲染都会创建新的函数
  const searchAPI = async (searchQuery) => {
    const response = await fetch(`/api/search?q=${searchQuery}`);
    return response.json();
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        const data = await searchAPI(query);
        setResults(data);
      }
    };
    fetchResults();
  }, [query, searchAPI]); // searchAPI 每次都是新的引用

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```
- 每次组件重新渲染，都会创建新的 `searchAPI` 函数
- `useEffect` 会因为 `searchAPI` 引用变化而重新执行
- 可能导致不必要的 API 调用和无限循环的风险

### 3. 事件处理函数的优化

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  // 缓存添加 todo 的函数
  const handleAddTodo = useCallback((text) => {
    setTodos(prevTodos => [...prevTodos, { id: Date.now(), text }]);
  }, []); // 空依赖数组，因为更新逻辑不依赖外部变量

  // 缓存删除 todo 的函数
  const handleDeleteTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []); // 空依赖数组

  return (
    <div>
      <AddTodoForm onAdd={handleAddTodo} />
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDeleteTodo}
        />
      ))}
    </div>
  );
}
```

#### 使用 useCallback 的效果
- 所有 TodoItem 组件共享同一个 `handleDeleteTodo` 函数实例
- 当添加新的 todo 时，已存在的 TodoItem 组件不会重新渲染
- 在 todo 列表很长的情况下，可以显著提升性能

#### 不使用 useCallback 的后果
```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  // 每次渲染都创建新的函数
  const handleAddTodo = (text) => {
    setTodos(prevTodos => [...prevTodos, { id: Date.now(), text }]);
  };

  const handleDeleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <AddTodoForm onAdd={handleAddTodo} />
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDeleteTodo}
        />
      ))}
    </div>
  );
}
```
- 每次 TodoList 重新渲染，都会创建新的 `handleAddTodo` 和 `handleDeleteTodo` 函数
- 所有 TodoItem 组件都会收到新的 `onDelete` prop，导致不必要的重新渲染
- 在 todo 列表较长时，可能导致明显的性能问题
- 如果 TodoItem 组件包含复杂的渲染逻辑或动画，性能影响会更明显

## 使用注意事项

1. **合理使用**
   - 不是所有函数都需要 useCallback
   - 只在性能优化需要时使用
   - 配合 React.memo 使用才有意义

2. **依赖项设置**
   - 正确设置依赖项，避免遗漏
   - 考虑使用 ESLint 的 exhaustive-deps 规则
   - 注意闭包陷阱

3. **避免过度优化**
   - 评估性能收益
   - 考虑开发维护成本
   - 使用性能测试工具验证优化效果

## useCallback vs useMemo

```jsx
// useCallback 缓存函数
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// 等价的 useMemo 写法
const handleClick = useMemo(() => {
  return () => console.log(count);
}, [count]);
```

### 主要区别

1. **用途**
   - useCallback：专门用于缓存函数
   - useMemo：用于缓存任何类型的值

2. **语法**
   - useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
   - useCallback 更适合处理函数缓存的场景

## 性能优化最佳实践

1. **合适的使用场景**
```jsx
// 好的使用场景
function Parent() {
  const handleChange = useCallback((value) => {
    // 复杂的处理逻辑
  }, [/* 相关依赖 */]);

  return <ExpensiveChild onChange={handleChange} />;
}

// 不必要的使用场景
function Parent() {
  // 简单组件不需要使用 useCallback
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>Click me</button>;
}
```

2. **配合 React.memo 使用**
```jsx
const MemoizedChild = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const handleClick = useCallback(() => {
    // 处理点击事件
  }, []); // 空依赖数组

  return <MemoizedChild onClick={handleClick} />;
}
```

## 实现原理

useCallback 的核心实现原理基于以下几点：

1. **依赖项比较**
   - 使用 Object.is 比较新旧依赖项
   - 只有当依赖项变化时才重新创建函数

2. **缓存机制**
   - 在 Fiber 节点上维护一个缓存
   - 缓存包含上一次的函数引用和依赖项

3. **基本实现示意**
```javascript
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}