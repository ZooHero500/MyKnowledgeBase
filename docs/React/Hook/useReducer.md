# useReducer Hook

`useReducer` 是 React 中用于管理复杂状态逻辑的 Hook。它是 `useState` 的替代方案，特别适合处理包含多个子值的复杂状态对象，或者当下一个状态依赖于之前的状态时。

## 基础用法

```jsx
const [state, dispatch] = useReducer(reducer, initialState, init);
```

### 简单示例

```jsx
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

## 最佳实践

### 1. Action 类型常量

使用常量定义 action 类型，避免拼写错误：

```jsx
// actions.js
export const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  DELETE_TODO: 'DELETE_TODO'
} as const;

// reducer.js
function todoReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_TODO:
      return [...state, { id: Date.now(), text: action.payload, completed: false }];
    case ACTIONS.TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case ACTIONS.DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}
```

### 2. Action 创建函数

使用 action 创建函数来封装 action 对象的创建：

```jsx
// actionCreators.js
export const addTodo = (text) => ({
  type: ACTIONS.ADD_TODO,
  payload: text
});

export const toggleTodo = (id) => ({
  type: ACTIONS.TOGGLE_TODO,
  payload: id
});

// Component.jsx
function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  const handleAdd = (text) => {
    dispatch(addTodo(text));
  };
}
```

### 3. 使用 TypeScript 类型定义

```typescript
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type State = Todo[];

type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number };

const todoReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: Date.now(), text: action.payload, completed: false }];
    // ... 其他 case
  }
};
```

## 高级技巧

### 1. 惰性初始化

当初始状态需要复杂计算时，使用第三个参数进行惰性初始化：

```jsx
// 初始化函数
function init(initialCount) {
  return {
    count: initialCount,
    history: [],
    lastUpdated: new Date()
  };
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  // ...
}
```

### 2. 组合多个 Reducer

当状态逻辑变得复杂时，可以将 reducer 拆分成多个小的 reducer：

```jsx
// 将状态和 reducer 拆分成多个部分
function todosReducer(state, action) {
  // 处理 todos 相关的 action
}

function filtersReducer(state, action) {
  // 处理筛选条件相关的 action
}

// 组合 reducer
function rootReducer(state, action) {
  return {
    todos: todosReducer(state.todos, action),
    filters: filtersReducer(state.filters, action)
  };
}

function TodoApp() {
  const [state, dispatch] = useReducer(rootReducer, {
    todos: [],
    filters: { status: 'all', priority: 'all' }
  });
}
```

### 3. 中间件模式

实现类似 Redux 中间件的模式：

```jsx
// 创建中间件
const loggingMiddleware = (reducer) => (state, action) => {
  console.log('Before:', state);
  console.log('Action:', action);
  
  const nextState = reducer(state, action);
  
  console.log('After:', nextState);
  return nextState;
};

const analyticsMiddleware = (reducer) => (state, action) => {
  // 发送 action 到分析服务
  trackAction(action);
  return reducer(state, action);
};

// 组合中间件
const withMiddleware = (...middlewares) => (reducer) =>
  middlewares.reduceRight((acc, middleware) => middleware(acc), reducer);

// 使用中间件
function App() {
  const enhancedReducer = withMiddleware(
    loggingMiddleware,
    analyticsMiddleware
  )(originalReducer);

  const [state, dispatch] = useReducer(enhancedReducer, initialState);
}
```

### 4. 异步操作处理

处理异步操作的模式：

```jsx
function dataReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        data: action.payload 
      };
    case 'FETCH_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
    default:
      return state;
  }
}

function DataComponent() {
  const [state, dispatch] = useReducer(dataReducer, {
    data: null,
    loading: false,
    error: null
  });

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await api.getData();
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: response.data 
      });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: error.message 
      });
    }
  };
}
```

## 使用场景

1. **复杂的状态逻辑**：当组件的状态逻辑变得复杂时，useReducer 可以帮助更好地组织代码。

2. **相关状态更新**：当多个状态更新紧密相关时，useReducer 可以确保它们的一致性。

3. **状态依赖**：当下一个状态依赖于之前的状态时，useReducer 提供了更可靠的状态更新方式。

4. **状态共享**：结合 Context API，useReducer 可以方便地在组件树中共享状态。

## 与 useState 的对比

| 特性 | useState | useReducer |
|------|----------|------------|
| 使用场景 | 简单状态管理 | 复杂状态逻辑 |
| 代码量 | 较少 | 较多 |
| 可测试性 | 一般 | 更好 |
| 状态预测性 | 一般 | 更好 |
| 状态更新 | 直接更新 | 通过 action 更新 |
| 性能优化 | 需要手动优化 | 内置优化 |

## 注意事项

1. **不要在 reducer 中进行副作用操作**
   - 副作用（如 API 调用）应该在组件中处理
   - reducer 应该是纯函数

2. **合理划分 action**
   - action 类型要具有描述性
   - 避免过于细粒度的 action

3. **避免过度使用**
   - 简单的状态管理仍然推荐使用 useState
   - 不要为了使用 useReducer 而使用 useReducer

4. **状态设计**
   - 保持状态扁平化
   - 避免冗余的状态数据