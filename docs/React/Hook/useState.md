# useState Hook

`useState` 是 React 中最基础也是最常用的 Hook，用于在函数组件中添加状态管理。虽然看似简单，但有一些高级用法和注意事项值得了解。

## 基础用法

```jsx
const [state, setState] = useState(initialState);
```

### 基本示例

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

## 高级技巧

### 1. 函数式更新

当新的状态需要基于之前的状态计算时，应该使用函数式更新而不是直接传值：

```jsx
// ❌ 可能导致问题的写法
setCount(count + 1);
setCount(count + 1);  // 这两次调用会导致只增加1

// ✅ 正确的写法
setCount(prevCount => prevCount + 1);
setCount(prevCount => prevCount + 1);  // 会正确增加2
```

### 2. 惰性初始化

如果初始状态需要复杂计算，可以传入一个函数：

```jsx
// ❌ 每次渲染都会执行复杂计算
const [state, setState] = useState(complexCalculation());

// ✅ 只在首次渲染时执行复杂计算
const [state, setState] = useState(() => complexCalculation());
```

### 3. 对象状态管理

处理对象状态时的常见陷阱和最佳实践：

```jsx
function UserForm() {
  // ❌ 不推荐的写法：分散的状态
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');

  // ✅ 推荐的写法：合并相关状态
  const [user, setUser] = useState({
    name: '',
    age: 0,
    email: ''
  });

  // ✅ 正确的更新对象方法
  const updateUser = (field, value) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };
}
```

### 4. 状态重置技巧

在 React 中，有时我们需要将组件的状态重置为初始值。这里有几种常见的方法：

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  // 方法1：使用 key 属性重置组件
  // 当 key 变化时，React 会完全卸载并重新挂载组件，从而重置所有状态
  return (
    <div key={filter}>
      <TodoItems todos={todos} />
    </div>
  );

  // 方法2：显式重置状态
  const resetState = () => {
    setTodos([]);
    setFilter('all');
  };

  // 方法3：使用 key 重置特定子组件
  return (
    <div>
      <TodoItems key={filter} todos={todos} />
    </div>
  );
}

// 实际应用示例：表单重置
function UserForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  // 提交后重置表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm(formData);
    // 方法1：直接设置初始值
    setFormData({
      username: '',
      email: ''
    });
    
    // 方法2：如果表单很复杂，可以使用 key 强制重新渲染
    // 通过改变 key 值使组件重新渲染，所有状态都会重置
    setFormKey(prev => prev + 1);
  };

  return (
    <form key={formKey} onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}
```

### 5. 状态提升的替代方案

有时我们不需要将所有共享状态都提升到父组件。这里有一些替代方案：

```jsx
// 场景：多个子组件需要共享计数器状态

// ❌ 传统的状态提升方式
function Parent() {
  // 所有状态都提升到父组件
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [total, setTotal] = useState(0);

  // 每个子组件的更新都需要父组件处理
  const updateCount1 = (newCount) => {
    setCount1(newCount);
    setTotal(newCount + count2);
  };

  const updateCount2 = (newCount) => {
    setCount2(newCount);
    setTotal(count1 + newCount);
  };

  return (
    <>
      <Counter1 count={count1} onUpdate={updateCount1} />
      <Counter2 count={count2} onUpdate={updateCount2} />
      <Total total={total} />
    </>
  );
}

// ✅ 使用回调的方式
function Parent() {
  const [total, setTotal] = useState(0);

  // 子组件只需要通知父组件变化量
  const handleCountChange = (change) => {
    setTotal(prev => prev + change);
  };

  return (
    <>
      <Counter1 onCountChange={handleCountChange} />
      <Counter2 onCountChange={handleCountChange} />
      <Total total={total} />
    </>
  );
}

function Counter1({ onCountChange }) {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prev => prev + 1);
    onCountChange(1); // 只通知变化量
  };

  return <button onClick={increment}>{count}</button>;
}
```

### 6. 条件状态初始化

条件状态初始化允许我们根据不同条件设置不同的初始状态，这在处理不同用户角色或特性时特别有用：

```jsx
// 场景1：根据用户角色初始化权限
function FeaturePanel({ user }) {
  // ❌ 不好的写法：条件判断在组件内部
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    if (user.role === 'admin') {
      setPermissions(['read', 'write', 'delete']);
    } else {
      setPermissions(['read']);
    }
  }, [user.role]);

  // ✅ 好的写法：在初始化时就确定权限
  const [permissions] = useState(() => {
    return user.role === 'admin' 
      ? ['read', 'write', 'delete']
      : ['read'];
  });
}

// 场景2：根据用户配置初始化设置
function UserSettings({ userPreferences }) {
  // ✅ 复杂初始化逻辑放在初始化函数中
  const [settings, setSettings] = useState(() => {
    // 可以包含复杂的逻辑
    const defaultSettings = {
      theme: 'light',
      fontSize: 14,
      notifications: true
    };

    return {
      ...defaultSettings,
      ...userPreferences, // 用户自定义设置覆盖默认值
      // 某些设置可能需要特殊处理
      fontSize: userPreferences.fontSize || defaultSettings.fontSize,
      theme: ['light', 'dark'].includes(userPreferences.theme) 
        ? userPreferences.theme 
        : defaultSettings.theme
    };
  });

  return (
    <div>
      <ThemeSelector value={settings.theme} />
      <FontSizeControl value={settings.fontSize} />
      {/* 其他设置控件 */}
    </div>
  );
}
```

这些技巧的关键点：

1. **状态重置技巧**：
   - 使用 `key` 属性是最简单的重置方式
   - 可以选择重置整个组件或特定子组件
   - 适合表单重置、列表刷新等场景

2. **状态提升替代方案**：
   - 不是所有共享状态都需要提升
   - 使用回调可以让子组件保持独立性
   - 父组件只需要知道状态的变化，而不需要管理所有状态

3. **条件状态初始化**：
   - 使用函数形式的初始值可以包含复杂逻辑
   - 避免在 useEffect 中进行可以在初始化时完成的状态设置
   - 适合处理用户角色、权限、偏好设置等场景

## 注意事项

1. **状态更新是异步的**
   - 不要依赖更新后的状态值立即可用
   - 使用 useEffect 或回调函数处理状态更新后的操作

2. **避免状态冗余**
   - 不要将可以由现有状态计算出的值作为新的状态
   - 使用 useMemo 缓存计算结果

3. **批量更新**
   - React 18 中的自动批处理机制
   - 多个 setState 调用会被合并为一次更新

4. **保持状态最小化**
   - 只存储必要的状态
   - 避免存储可以通过计算得到的值

## 性能优化

1. **使用局部状态**
   ```jsx
   function App() {
     // ❌ 不需要的全局状态
     const [isHovered, setIsHovered] = useState(false);
     
     return (
       <div>
         <HoverComponent /> {/* ✅ 将 hover 状态移到这个组件内 */}
       </div>
     );
   }
   ```

2. **状态分割**
   ```jsx
   // ❌ 频繁变化的状态和稳定的状态混合
   const [state, setState] = useState({
     frequentlyChanging: 0,
     stable: 'data'
   });

   // ✅ 分离状态
   const [changingState, setChangingState] = useState(0);
   const [stableState, setStableState] = useState('data');
   ```

这些技巧和注意事项能帮助你更好地使用 useState，写出更高质量的 React 代码。记住，虽然 useState 看似简单，但合理使用这些进阶技巧可以显著提升应用的性能和可维护性。