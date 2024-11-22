# useImperativeHandle Hook

`useImperativeHandle` 是一个用于自定义 `ref` 暴露给父组件的实例值的 Hook。它通常与 `forwardRef` 一起使用，用于向父组件暴露自定义的方法或属性。

## 基础语法

```jsx
useImperativeHandle(ref, createHandle, dependencies?)
```

## 基础用法

```jsx
import React, { useImperativeHandle, forwardRef, useRef } from 'react';

// 子组件
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    // 只暴露特定的方法给父组件
    focus: () => {
      inputRef.current.focus();
    },
    // 自定义方法
    setValue: (value) => {
      inputRef.current.value = value;
    }
  }));

  return <input ref={inputRef} />;
});

// 父组件
function Parent() {
  const fancyInputRef = useRef();

  const handleClick = () => {
    // 调用子组件暴露的方法
    fancyInputRef.current.focus();
    fancyInputRef.current.setValue('Hello!');
  };

  return (
    <div>
      <FancyInput ref={fancyInputRef} />
      <button onClick={handleClick}>Focus and Set Value</button>
    </div>
  );
}
```

## 实际应用场景

### 1. 自定义表单控件

```jsx
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    // 暴露表单验证方法
    validate: () => {
      const isValid = value.length >= 3;
      return {
        isValid,
        error: isValid ? null : '输入长度至少为3个字符'
      };
    },
    // 暴露重置方法
    reset: () => {
      setValue('');
      inputRef.current.value = '';
    },
    // 暴露获取值方法
    getValue: () => value
  }));

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
    />
  );
});

// 使用自定义表单控件
function Form() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, error } = inputRef.current.validate();
    
    if (isValid) {
      const value = inputRef.current.getValue();
      // 处理表单提交
      console.log('提交值:', value);
    } else {
      console.log('验证错误:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomInput ref={inputRef} />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 2. 复杂组件控制

```jsx
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useImperativeHandle(ref, () => ({
    // 播放控制
    play: () => {
      videoRef.current.play();
      setPlaying(true);
    },
    pause: () => {
      videoRef.current.pause();
      setPlaying(false);
    },
    // 播放位置控制
    seekTo: (time) => {
      videoRef.current.currentTime = time;
    },
    // 音量控制
    setVolume: (volume) => {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    },
    // 获取当前状态
    getState: () => ({
      currentTime: videoRef.current.currentTime,
      duration: videoRef.current.duration,
      playing,
      volume: videoRef.current.volume
    })
  }));

  return <video ref={videoRef} src={props.src} />;
});

// 使用视频播放器
function VideoController() {
  const playerRef = useRef(null);

  const handlePlay = () => {
    playerRef.current.play();
  };

  const handleSeek = () => {
    playerRef.current.seekTo(30); // 跳转到30秒
  };

  const handleGetState = () => {
    const state = playerRef.current.getState();
    console.log('播放器状态:', state);
  };

  return (
    <div>
      <VideoPlayer ref={playerRef} src="video.mp4" />
      <button onClick={handlePlay}>播放</button>
      <button onClick={handleSeek}>跳转到30秒</button>
      <button onClick={handleGetState}>获取状态</button>
    </div>
  );
}
```

### 3. 动画控制

```jsx
const AnimatedComponent = forwardRef((props, ref) => {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // 开始动画
    startAnimation: () => {
      if (animationRef.current) return;
      
      let start = null;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        // 执行动画
        elementRef.current.style.transform = 
          `translateX(${Math.min(progress / 10, 200)}px)`;
        
        if (progress < 2000) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    },
    // 停止动画
    stopAnimation: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    },
    // 重置位置
    reset: () => {
      elementRef.current.style.transform = 'translateX(0)';
    }
  }));

  return <div ref={elementRef}>{props.children}</div>;
});
```

## 最佳实践

### 1. 限制暴露的方法

只暴露必要的方法和属性：

```jsx
// 错误示范：暴露过多内部实现
useImperativeHandle(ref, () => ({
  inputRef: inputRef.current, // 不应该暴露整个 DOM 节点
  internalState: someInternalState,
  // ... 其他内部实现细节
}));

// 好的做法：只暴露必要的接口
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current.focus(),
  setValue: (value) => {
    // 可以在这里添加验证逻辑
    inputRef.current.value = value;
  }
}));
```

### 2. 使用 TypeScript 定义接口

```typescript
interface ImperativeHandle {
  focus: () => void;
  setValue: (value: string) => void;
  validate: () => { isValid: boolean; error?: string };
}

const CustomInput = forwardRef<ImperativeHandle, Props>((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => { /* ... */ },
    setValue: (value) => { /* ... */ },
    validate: () => { /* ... */ }
  }));
  
  return <input />;
});
```

### 3. 性能优化

使用依赖数组避免不必要的更新：

```jsx
useImperativeHandle(
  ref,
  () => ({
    getData: () => ({
      value,
      timestamp: Date.now()
    })
  }),
  [value] // 只有当 value 改变时才更新 handle
);
```

## 注意事项

1. **避免过度使用**
   - useImperativeHandle 应该只用于必要的场景
   - 优先考虑使用 props 和 state 进行组件通信

2. **保持简单性**
   - 暴露的方法应该简单且明确
   - 避免在暴露的方法中包含复杂的状态管理逻辑

3. **及时清理**
   ```jsx
   useImperativeHandle(ref, () => {
     const timer = setInterval(() => {
       // 某些操作
     }, 1000);
     
     return {
       cleanup: () => {
         clearInterval(timer);
       }
     };
   });
   ```

4. **正确使用 forwardRef**
   - useImperativeHandle 必须配合 forwardRef 使用
   - 确保组件是用 forwardRef 包装的

useImperativeHandle 是一个强大的 Hook，但应该谨慎使用。它主要用于以下场景：
- 需要精确控制暴露给父组件的实例值
- 需要自定义复杂组件的命令式接口
- 需要优化性能，只暴露必要的方法