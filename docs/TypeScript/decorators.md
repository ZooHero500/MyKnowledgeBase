# 装饰器

## 简介

装饰器是一种特殊类型的声明,它能够被附加到类声明、方法、访问符、属性或参数上。装饰器使用 `@expression` 这种形式,`expression` 求值后必须为一个函数,它会在运行时被调用,被装饰的声明信息做为参数传入。

关键词：`复用`，`可读性`，`可维护性`

## 装饰器的效果

装饰器可以用来:

1. 修改或扩展类、方法、属性的行为
2. 添加元数据
3. 实现面向切面编程(AOP)

## 装饰器的目的

1. 代码复用: 通过装饰器,可以将通用的逻辑抽象出来,减少重复代码。
2. 分离关注点: 将核心业务逻辑与横切关注点(如日志、权限)分离。
3. 提高可维护性: 通过装饰器,可以在不修改原有代码的情况下扩展功能。
4. 增强可读性: 装饰器可以清晰地表达代码的意图,使代码更易理解。
5. 元编程: 允许在运行时分析和修改代码的结构和行为。

## 装饰器的解析

装饰器在编译时会被转换为函数调用。例如:

```typescript
@sealed
class Greeter {}

// 编译后大致相当于:
let Greeter = sealed(class Greeter {})
```

## 装饰器的应用场景

### 1. 类装饰器:

- 依赖注入
- 日志记录
- 性能监控

```typescript
function log(constructor: Function) {
  // 类的构造函数
  console.log(`Class ${constructor.name} was created`)
}

@log
class Example {}
```

#### 一些示例

a. 依赖注入装饰器
```typescript
function Injectable() {
  return function (target: any) {
    // 将类注册到依赖注入容器
    DependencyContainer.register(target)
  }
}

@Injectable()
class UserService {
  // ...
}
```

b. 日志记录装饰器
```typescript
function Logger() {
  return function (constructor: Function) {
    console.log(`类 ${constructor.name} 被创建`)
    // 为类的所有方法添加日志
    for (const propertyName of Object.getOwnPropertyNames(constructor.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName)
      const isMethod = descriptor.value instanceof Function
      if (!isMethod) continue

      Object.defineProperty(constructor.prototype, propertyName, {
        value: function (...args: any[]) {
          console.log(`调用方法 ${propertyName}`)
          return descriptor.value.apply(this, args)
        }
      })
    }
  }
}

@Logger()
class ExampleClass {
  method1() {
    /* ... */
  }
  method2() {
    /* ... */
  }
}
```

c. 性能监控装饰器
```typescript
function PerformanceMonitor() {
  return function (constructor: Function) {
    // 为类的所有方法添加性能监控
    for (const propertyName of Object.getOwnPropertyNames(constructor.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName)
      const isMethod = descriptor.value instanceof Function
      if (!isMethod) continue

      Object.defineProperty(constructor.prototype, propertyName, {
        value: function (...args: any[]) {
          const start = performance.now()
          const result = descriptor.value.apply(this, args)
          const end = performance.now()
          console.log(`方法 ${propertyName} 执行时间: ${end - start}ms`)
          return result
        }
      })
    }
  }
}

@PerformanceMonitor()
class DataProcessor {
  processData() {
    // 模拟数据处理
    for (let i = 0; i < 1000000; i++) {
      // 一些操作
    }
  }
}
```

d. 单例模式装饰器
```typescript
function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    private static instance: T
    constructor(...args: any[]) {
      super(...args)
      if (Singleton.instance) {
        return Singleton.instance
      }
      Singleton.instance = this
    }
  }
}

@Singleton
class ConfigManager {
  private config: object = {}

  loadConfig() {
    // 加载配置
  }
}
```

e. 自动错误处理装饰器
```typescript
function AutoErrorHandler() {
  return function (constructor: Function) {
    for (const propertyName of Object.getOwnPropertyNames(constructor.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, propertyName)
      const isMethod = descriptor.value instanceof Function
      if (!isMethod) continue

      Object.defineProperty(constructor.prototype, propertyName, {
        value: function (...args: any[]) {
          try {
            return descriptor.value.apply(this, args)
          } catch (error) {
            console.error(`方法 ${propertyName} 执行出错:`, error)
            // 可以在这里添加错误处理逻辑,如发送错误报告等
          }
        }
      })
    }
  }
}

@AutoErrorHandler()
class ApiService {
  fetchData() {
    // 可能抛出错误的操作
    throw new Error('网络错误')
  }
}
```

### 2. 方法装饰器:

- 方法拦截
- 缓存
- 权限检查

```typescript
function checkAuth(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  /**
   * 参数：
   * - 对于静态成员来说是类的构造函数,对于实例成员是类的原型对象
   * - 成员的名字
   * - 成员的属性描述符
   */
  let originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    if (isAuthorized()) {
      return originalMethod.apply(this, args)
    } else {
      throw new Error('未授权')
    }
  }
}

class Example {
  @checkAuth
  sensitiveOperation() {
    console.log('执行敏感操作')
  }
}
```

### 3. 属性装饰器:

- 数据验证
- 自动序列化/反序列化

```typescript
function validate(target: any, propertyKey: string) {
  /**
   * 参数
   * - 对于静态成员来说是类的构造函数,对于实例成员是类的原型对象
   * - 成员的名字
   */
  let value: string
  const getter = function () {
    return value
  }
  const setter = function (newVal: string) {
    if (newVal.length < 3) {
      throw new Error('值的长度不能小于3')
    }
    value = newVal
  }
  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter
  })
}

class User {
  @validate
  name: string
}
```

### 4. 参数装饰器:

- 参数验证
- 依赖注入
- 参数转换
- 日志记录
- 性能监控

a. 参数验证示例
确保传入的参数符合特定条件,如必须为正数。

```typescript
function validatePositive(target: any, methodName: string, paramIndex: number) {
  let originalMethod = target[methodName]
  target[methodName] = function (...args: any[]) {
    if (args[paramIndex] <= 0) {
      throw new Error(`参数 ${paramIndex} 必须为正数`)
    }
    return originalMethod.apply(this, args)
  }
}

class Calculator {
  add(@validatePositive a: number, @validatePositive b: number) {
    return a + b
  }
}
```

b. 依赖注入示例
自动注入所需的服务或依赖。

```typescript
function inject(serviceIdentifier: string) {
  return function (target: any, methodName: string, paramIndex: number) {
    // 假设我们有一个全局的依赖注入容器
    target[methodName] = function (...args: any[]) {
      args[paramIndex] = container.get(serviceIdentifier)
      return target[methodName].apply(this, args)
    }
  }
}

class UserService {
  getUser(@inject('Database') db: Database, userId: string) {
    return db.findUser(userId)
  }
}
```

c. 参数转换示例
在方法执行前自动转换参数,如将 JSON 字符串解析为对象。

```typescript
function parseJson(target: any, methodName: string, paramIndex: number) {
  let originalMethod = target[methodName]
  target[methodName] = function (...args: any[]) {
    if (typeof args[paramIndex] === 'string') {
      args[paramIndex] = JSON.parse(args[paramIndex])
    }
    return originalMethod.apply(this, args)
  }
}

class DataProcessor {
  process(@parseJson data: any) {
    // 处理数据
  }
}
```

d. 日志记录示例
自动记录方法调用的参数信息,便于调试和监控。

```typescript
function logParameter(target: any, methodName: string, paramIndex: number) {
  let originalMethod = target[methodName]
  target[methodName] = function (...args: any[]) {
    console.log(`方法 ${methodName} 的第 ${paramIndex} 个参数值为:`, args[paramIndex])
    return originalMethod.apply(this, args)
  }
}

class Logger {
  log(@logParameter message: string) {
    // 记录日志
  }
}
```
