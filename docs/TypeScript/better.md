# TypeScript 最佳实践和设计模式

## 1. 代码组织和结构

在 TypeScript 项目中,良好的代码组织和结构对于提高代码的可维护性和可读性至关重要。以下是一些最佳实践:

### 1.1 目录结构

一个典型的 TypeScript 项目目录结构可能如下:

```
src/
  ├── components/
  ├── services/
  ├── utils/
  ├── types/
  ├── constants/
  ├── hooks/ (如果是React项目)
  ├── assets/
  ├── styles/
  └── index.ts
tests/
package.json
tsconfig.json
```

- `src/`: 存放所有源代码
- `components/`: 存放 UI 组件
- `services/`: 存放与后端 API 交互的服务
- `utils/`: 存放通用工具函数
- `types/`: 存放类型定义
- `constants/`: 存放常量
- `hooks/`: 存放自定义 hooks (如果是 React 项目)
- `assets/`: 存放静态资源
- `styles/`: 存放样式文件
- `tests/`: 存放测试文件

### 1.2 命名约定

- 使用 PascalCase 命名类和接口
- 使用 camelCase 命名变量和函数
- 使用 UPPER_CASE 命名常量
- 使用 kebab-case 命名文件

### 1.3 模块化

尽量将相关的功能组织在一起,每个文件只导出一个主要的类、函数或对象。这样可以提高代码的可维护性和可测试性。

```typescript
// bad
export function func1() {
  /* ... */
}
export function func2() {
  /* ... */
}

// good
export default class MyService {
  func1() {
    /* ... */
  }
  func2() {
    /* ... */
  }
}
```

### 1.4 使用 barrel 文件

在每个目录中创建一个 index.ts 文件,用于重新导出该目录中的所有模块。这样可以简化导入语句。

```typescript
// services/index.ts
export * from './userService'
export * from './productService'

// 在其他文件中使用
import { UserService, ProductService } from './services'
```

### 1.5 类型定义

将类型定义放在单独的文件中,并在需要的地方导入。这样可以提高类型的复用性和维护性。

```typescript
// types/user.ts
export interface User {
  id: number
  name: string
  email: string
}

// 在其他文件中使用
import { User } from '../types/user'
```

## 2. 常见设计模式在 TypeScript 中的实现

TypeScript 的静态类型系统和面向对象特性使得实现各种设计模式变得更加容易和类型安全。以下是一些常见设计模式的 TypeScript 实现:

### 2.1 单例模式

单例模式确保一个类只有一个实例,并提供一个全局访问点。

```typescript
class Singleton {
  private static instance: Singleton

  private constructor() {}

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton()
    }
    return Singleton.instance
  }

  public someMethod() {
    console.log('Singleton method called')
  }
}

const instance1 = Singleton.getInstance()
const instance2 = Singleton.getInstance()
console.log(instance1 === instance2) // true
```

### 2.2 工厂模式

工厂模式用于创建对象,而不需要指定创建对象的确切类。

```typescript
interface Product {
  operation(): string
}

class ConcreteProduct1 implements Product {
  public operation(): string {
    return 'ConcreteProduct1'
  }
}

class ConcreteProduct2 implements Product {
  public operation(): string {
    return 'ConcreteProduct2'
  }
}

class Creator {
  public static createProduct(type: number): Product {
    if (type === 1) {
      return new ConcreteProduct1()
    } else {
      return new ConcreteProduct2()
    }
  }
}

const product1 = Creator.createProduct(1)
console.log(product1.operation()) // ConcreteProduct1
```

### 2.3 观察者模式

观察者模式定义了对象之间的一对多依赖关系,当一个对象状态改变时,所有依赖于它的对象都会得到通知并自动更新。

```typescript
// 定义观察者接口
interface Observer {
  update(message: string): void
}

// 实现观察者接口的具体观察者类
class ConcreteObserver implements Observer {
  private name: string // 观察者的名称

  constructor(name: string) {
    this.name = name // 初始化观察者的名称
  }

  // 实现update方法，用于接收消息
  public update(message: string): void {
    console.log(`${this.name} received message: ${message}`) // 打印观察者接收到的消息
  }
}

// 定义主题类，用于管理观察者
class Subject {
  private observers: Observer[] = [] // 存储观察者的数组

  // 添加观察者
  public attach(observer: Observer): void {
    this.observers.push(observer) // 将观察者添加到数组中
  }

  // 移除观察者
  public detach(observer: Observer): void {
    const index = this.observers.indexOf(observer) // 查找观察者在数组中的索引
    if (index !== -1) {
      this.observers.splice(index, 1) // 移除观察者
    }
  }

  // 通知所有观察者
  public notify(message: string): void {
    for (const observer of this.observers) {
      observer.update(message) // 调用每个观察者的update方法，传入消息
    }
  }
}

// 创建主题实例
const subject = new Subject()
// 创建两个观察者实例
const observer1 = new ConcreteObserver('Observer 1')
const observer2 = new ConcreteObserver('Observer 2')

// 将观察者添加到主题中
subject.attach(observer1)
subject.attach(observer2)

// 通知所有观察者
subject.notify('Hello, observers!')
// Observer 1 received message: Hello, observers!
// Observer 2 received message: Hello, observers!
```

### 2.4 策略模式

策略模式定义了一系列算法,并使它们可以互相替换。

```typescript
// 定义策略接口
interface Strategy {
  execute(data: number[]): number // 执行策略，返回一个数
}

// 平均策略类，实现策略接口
class AverageStrategy implements Strategy {
  public execute(data: number[]): number {
    const sum = data.reduce((a, b) => a + b, 0) // 计算数组元素的和
    return sum / data.length // 返回平均值
  }
}

// 最大值策略类，实现策略接口
class MaxStrategy implements Strategy {
  public execute(data: number[]): number {
    return Math.max(...data) // 返回数组中的最大值
  }
}

// 上下文类，用于管理策略
class Context {
  private strategy: Strategy // 私有变量，存储策略对象

  constructor(strategy: Strategy) {
    this.strategy = strategy // 构造函数，初始化策略
  }

  public setStrategy(strategy: Strategy) {
    this.strategy = strategy // 设置策略
  }

  public executeStrategy(data: number[]): number {
    return this.strategy.execute(data) // 执行策略
  }
}

// 示例数据
const data = [1, 2, 3, 4, 5]
// 创建上下文对象，使用平均策略
const context = new Context(new AverageStrategy())
console.log(context.executeStrategy(data)) // 输出平均值

// 更换策略为最大值策略
context.setStrategy(new MaxStrategy())
console.log(context.executeStrategy(data)) // 输出最大值
```
