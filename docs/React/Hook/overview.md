# React Hooks 完全指南

React Hooks 是 React 16.8 引入的特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。本指南将详细介绍 React 中常用的 Hooks。

## 基础 Hooks

1. [useState](/React/Hook/useState.md)
   - 状态管理的基础 Hook
   - 用于在函数组件中添加状态

2. [useEffect](/React/Hook/useEffect.md)
   - 处理副作用
   - 替代生命周期方法

3. [useContext](/React/Hook/UseContext.md)
   - 订阅 React Context
   - 跨组件共享状态

## 性能优化 Hooks

1. [useMemo](/React/Hook/UseMemo.md)
   - 缓存计算结果
   - 优化性能

2. [useCallback](/React/Hook/UseCallback.md)
   - 缓存函数
   - 防止不必要的重渲染

## 状态管理 Hooks

1. [useReducer](/React/Hook/useReducer.md)
   - 复杂状态管理
   - Redux 风格的状态处理

## 其他 Hooks

1. [useRef](/React/Hook/useRef.md)
   - 保存可变值
   - 访问 DOM 元素

2. [useImperativeHandle](/React/Hook/useImperativeHandle.md)
   - 自定义暴露给父组件的实例值

3. [useLayoutEffect](/React/Hook/useLayoutEffect.md)
   - 同步执行副作用
   - 用于 DOM 变更测量

## 自定义 Hooks

1. [自定义 Hooks 最佳实践](/React/Hook/CustomHooks.md)
   - 创建自定义 Hooks
   - 常见使用模式
   - 注意事项

## Hooks 规则

1. **只在最顶层使用 Hooks**
   - 不要在循环，条件或嵌套函数中调用 Hook
   - 确保 Hooks 在每次渲染时都以相同的顺序被调用

2. **只在 React 函数中调用 Hooks**
   - 在 React 的函数组件中调用 Hook
   - 在自定义 Hook 中调用其他 Hook

## 常见问题与最佳实践

1. **依赖项处理**
   - 如何正确设置依赖项
   - 如何处理依赖项变化
   - ESLint 规则的使用

2. **性能优化**
   - 何时使用 useMemo 和 useCallback
   - 如何避免不必要的重渲染
   - 性能测量和优化技巧

3. **状态管理策略**
   - 何时使用 useState vs useReducer
   - 如何组织复杂的状态逻辑
   - 状态提升和状态下放的考虑

## 调试技巧

1. **开发工具**
   - React DevTools 的使用
   - 调试 Hooks 的方法
   - 常见问题排查

2. **性能分析**
   - 使用 React Profiler
   - 识别性能瓶颈
   - 优化策略
