# Custom Hooks

自定义 Hook 是一种复用状态逻辑的方式，它可以让你在不同的组件之间复用相同的状态逻辑。自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

## 基本概念

### 命名规范
- 必须以 "use" 开头
- 采用驼峰命名法
- 名称应该能清晰表达其功能

```jsx
// 好的命名
useWindowSize()
useOnlineStatus()
useFormInput()

// 不好的命名
usehook()
windowSize()
```

### 基本结构
```typescript
function useCustomHook(initialValue: any) {
  // 1. 可以使用任何其他 Hook
  const [state, setState] = useState(initialValue);
  
  // 2. 可以包含任何组件逻辑
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  // 3. 返回需要的状态或方法
  return {
    state,
    setState
  };
}
```

## 常见示例

### 1. 窗口尺寸监听
```typescript
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用示例
function App() {
  const { width, height } = useWindowSize();
  return <div>Window size: {width} x {height}</div>;
}
```

### 2. 表单输入处理
```typescript
function useFormInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(initialValue);
  };

  return {
    value,
    onChange: handleChange,
    reset,
  };
}

// 使用示例
function LoginForm() {
  const username = useFormInput('');
  const password = useFormInput('');

  return (
    <form>
      <input type="text" {...username} />
      <input type="password" {...password} />
    </form>
  );
}
```

### 3. 异步数据获取
```typescript
function useDataFetching<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用示例
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useDataFetching<User>(
    `/api/users/${userId}`
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>User: {data.name}</div>;
}
```

### 4. 本地存储
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 更新存储值
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// 使用示例
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

## 最佳实践

### 1. 单一职责
每个自定义 Hook 应该只做一件事，并且做好这件事。

```typescript
// 好的做法：专注于一个功能
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// 不好的做法：混合多个不相关的功能
function useMultipleThings() {
  const [isOnline, setIsOnline] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [theme, setTheme] = useState('light');
  // ... 更多状态和逻辑
}
```

### 2. 合理的依赖管理
确保 useEffect 的依赖数组正确设置，避免无限循环。

```typescript
// 好的做法：正确的依赖管理
function useSearch(query: string) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const searchAPI = async () => {
      const data = await fetch(`/api/search?q=${query}`);
      setResults(await data.json());
    };

    if (query) {
      searchAPI();
    }
  }, [query]); // 只在 query 改变时执行

  return results;
}

// 不好的做法：缺失依赖
function useData(id: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(id);
  }, []); // 警告：缺少依赖项 'id'
}
```

### 3. 错误处理
添加适当的错误处理和边界情况检查。

```typescript
function useApi<T>(url: string) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        if (!url) {
          throw new Error('URL is required');
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (mounted) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, error: error as Error, loading: false });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [url]);

  return state;
}
```

### 4. 类型安全
在 TypeScript 中，为自定义 Hook 添加适当的类型定义。

```typescript
interface UseCounterProps {
  initialValue?: number;
  step?: number;
  min?: number;
  max?: number;
}

function useCounter({
  initialValue = 0,
  step = 1,
  min = -Infinity,
  max = Infinity
}: UseCounterProps = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => Math.min(max, c + step));
  }, [max, step]);

  const decrement = useCallback(() => {
    setCount(c => Math.max(min, c - step));
  }, [min, step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset
  } as const;
}
```

## 注意事项

1. **避免过早抽象**
   - 在多个组件中发现相同的逻辑模式后再创建自定义 Hook
   - 不要为了复用而复用

2. **性能考虑**
   - 使用 useMemo 和 useCallback 优化性能
   - 避免在每次渲染时创建新的函数或对象

3. **副作用清理**
   - 始终清理副作用（定时器、事件监听器等）
   - 检查组件是否已卸载

4. **命名和文档**
   - 使用清晰的命名约定
   - 添加适当的注释和文档
   - 包含使用示例