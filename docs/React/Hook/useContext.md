## useContext 的作用 / 解决了什么问题？

useContext 是 React 提供的一个 Hook，用于解决 React 组件之间的数据共享问题。它主要解决了以下问题：

1. **避免 Props 层层传递（Props Drilling）**
   - 在不使用 Context 的情况下，要将数据从顶层组件传递到深层组件，需要通过中间的每一层组件手动传递 props
   - 使用 Context 可以直接在需要的组件中获取数据，无需通过中间组件传递

2. **提供全局状态管理**
   - 适用于主题、语言、用户认证等全局状态的管理
   - 相比 Redux 等状态管理库，对于简单的全局状态管理场景更加轻量

## useContext 实际应用场景

### 1. 主题切换功能

```jsx
// 创建 Context
const ThemeContext = React.createContext('light');

// 提供者组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 消费者组件
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题：{theme}
    </button>
  );
}
```

### 2. 用户认证状态管理

```jsx
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. 多语言国际化

```jsx
const LanguageContext = React.createContext('zh');

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh');
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

## useContext 使用注意事项

1. **性能考虑**
   - Context 的值发生变化时，所有使用该 Context 的组件都会重新渲染
   - 可以配合 useMemo 优化性能

2. **适用场景**
   - 适合全局或特定组件树共享的数据
   - 对于组件局部状态，推荐使用 useState
   - 对于复杂的状态管理，考虑使用 Redux 等专门的状态管理库

3. **最佳实践**
   - 将 Provider 放在组件树的较高层级
   - 适当拆分 Context，避免不必要的重渲染
   - 考虑使用 Context 的默认值

## useContext 实现原理

useContext 的核心实现原理包括以下几个方面：

1. **订阅机制**
   - 通过 React 的内部 fiber 树实现
   - 当 Provider 的 value 发生变化时，会触发订阅了该 Context 的组件更新

2. **查找最近的 Provider**
   - 从当前组件开始，沿着组件树向上查找最近的 Provider
   - 如果找不到 Provider，则使用 createContext 时提供的默认值

3. **基本实现示意**

```javascript
function useContext(Context) {
  const currentFiber = getCurrentFiber();
  // 查找最近的 Provider
  const contextValue = readContext(Context, currentFiber);
  return contextValue;
}
```

## 与其他状态管理方案的对比

1. **vs Redux**
   - Context：适用于简单的全局状态管理
   - Redux：适用于复杂的状态管理，有完整的状态追踪和调试工具

2. **vs Mobx**
   - Context：React 原生解决方案，学习成本低
   - Mobx：提供响应式编程模型，更适合复杂的状态管理场景

3. **vs Recoil**
   - Context：适用于静态数据和简单状态
   - Recoil：专为 React 设计的状态管理库，适合原子级的状态管理