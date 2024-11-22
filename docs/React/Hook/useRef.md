# useRef Hook

`useRef` 是 React 中一个非常实用的 Hook，主要用于两个场景：
1. 访问 DOM 元素或组件实例
2. 保存不需要触发重新渲染的可变值

## 基础用法

```jsx
const refContainer = useRef(initialValue);
```

### 1. 访问 DOM 元素

最常见的用法是获取 DOM 元素的引用：

```jsx
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

### 2. 保存可变值

useRef 可以保存任何可变值，且这个值的改变不会触发组件重新渲染：

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);

  // 清除定时器
  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <>
      <div>Timer: {count}</div>
      <button onClick={stopTimer}>Stop Timer</button>
    </>
  );
}
```

## 常见使用场景

### 1. 表单操作

```jsx
function Form() {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 获取表单数据
    const formData = new FormData(formRef.current);
    // ... 处理表单数据
  };

  const handleUpload = () => {
    // 程序触发文件选择
    fileInputRef.current.click();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button type="button" onClick={handleUpload}>
        上传文件
      </button>
    </form>
  );
}
```

### 2. 视频/音频控制

```jsx
function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  const handlePlay = () => {
    videoRef.current.play();
  };

  const handlePause = () => {
    videoRef.current.pause();
  };

  const handleSeek = (time) => {
    videoRef.current.currentTime = time;
  };

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={handlePlay}>播放</button>
      <button onClick={handlePause}>暂停</button>
      <button onClick={() => handleSeek(10)}>跳转到 10s</button>
    </div>
  );
}
```

### 3. 保存前一个值

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const prevCount = prevCountRef.current;
  return (
    <div>
      <p>Now: {count}, before: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 4. 缓存计算结果

```jsx
function ExpensiveComponent({ data }) {
  const computedValueRef = useRef(null);
  
  if (computedValueRef.current === null) {
    // 昂贵的计算只会执行一次
    computedValueRef.current = expensiveComputation(data);
  }

  return <div>{computedValueRef.current}</div>;
}
```

## 高级用法

### 1. 结合 TypeScript

```typescript
// DOM 元素引用
const inputRef = useRef<HTMLInputElement>(null);

// 可变值引用
const countRef = useRef<number>(0);

// 带初始值的引用
const valueRef = useRef<string>('initial');
```

### 2. 条件性引用

```jsx
function ConditionalRef({ shouldFocus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [shouldFocus]);

  return <input ref={inputRef} />;
}
```

### 3. 回调 ref

当你需要在 ref 被附加或分离时执行一些操作：

```jsx
function MeasureExample() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback(node => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <div ref={measuredRef}>Hello, world</div>
      <p>The above div is {Math.round(height)}px tall</p>
    </>
  );
}
```

## 注意事项

1. **不要在渲染期间更新 ref 值**
   ```jsx
   // ❌ 错误示范
   function BadComponent() {
     const ref = useRef(0);
     // 在渲染期间修改 ref
     ref.current += 1;
     return <div>{ref.current}</div>;
   }
   ```

2. **ref 更新不会触发重新渲染**
   ```jsx
   // ❌ 不会工作
   const ref = useRef(0);
   const updateValue = () => {
     ref.current += 1; // 不会导致重新渲染
     // 需要使用 useState 来触发重新渲染
   };
   ```

3. **不要过度使用 ref**
   - ref 主要用于访问 DOM 元素和存储不需要触发重新渲染的值
   - 如果需要触发重新渲染的值，应该使用 useState

4. **清理工作**
   ```jsx
   useEffect(() => {
     const id = setInterval(() => {
       // ...
     }, 1000);
     
     return () => {
       // 清理定时器
       clearInterval(id);
     };
   }, []);
   ```

## 最佳实践

1. **合理使用 ref**
   - 用于 DOM 操作
   - 存储定时器/动画帧 ID
   - 存储不需要触发重新渲染的值

2. **初始化时机**
   ```jsx
   // ✅ 好的做法
   const ref = useRef(null);
   
   useEffect(() => {
     // 在 DOM 准备好后初始化
     if (ref.current) {
       // 初始化操作
     }
   }, []);
   ```

3. **结合其他 Hooks**
   ```jsx
   function Component() {
     const ref = useRef(null);
     
     useEffect(() => {
       // 使用 ref
     }, []);
     
     useLayoutEffect(() => {
       // 需要在 DOM 更新之后立即执行的操作
     }, []);
   }
   ```

useRef 是 React 中一个非常实用的 Hook，它不仅可以用于访问 DOM 元素，还可以用于存储任何不需要触发重新渲染的可变值。合理使用 useRef 可以帮助我们更好地处理副作用和性能优化。