# TypeScript 高级主题

## 条件类型

条件类型允许我们根据某个条件来决定最终的类型。它的语法类似于 JavaScript 的三元运算符。

```typescript
type Check<T> = T extends string ? '是字符串' : '不是字符串'

type A = Check<string> // "是字符串"
type B = Check<number> // "不是字符串"
```

条件类型常与泛型和映射类型结合使用，可以创建复杂的类型转换。

```typescript
type NonNullable<T> = T extends null | undefined ? never : T

type C = NonNullable<string | null | undefined> // string
```

## 类型推断和类型兼容性

### 类型推断

TypeScript 能够根据上下文自动推断变量的类型。

```typescript
let x = 3 // TypeScript 推断 x 的类型为 number
let arr = [1, 2, 3] // TypeScript 推断 arr 的类型为 number[]
```

### 类型兼容性

TypeScript 使用结构类型系统。如果两个对象具有相同的形状，它们就被认为是相同的类型。

```typescript
interface Point {
  x: number
  y: number
}

let p: Point = { x: 10, y: 20 }
let p2 = { x: 1, y: 2, z: 3 }

p = p2 // 允许，因为 p2 包含 Point 所需的所有属性
```

## 协变和逆变

协变和逆变是描述类型转换后的兼容性的概念。

### 协变（Covariance）

如果 A 是 B 的子类型，那么 T<A> 也是 T<B> 的子类型。

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

let animals: Animal[] = []
let dogs: Dog[] = []

animals = dogs // 允许，因为 Dog[] 是 Animal[] 的子类型
```

### 逆变（Contravariance）

如果 A 是 B 的子类型，那么 T<B> 是 T<A> 的子类型。这在函数参数中常见。

```typescript
type Logger<T> = (param: T) => void

let logAnimal: Logger<Animal> = animal => console.log(animal.name)
let logDog: Logger<Dog> = dog => console.log(dog.breed)

logDog = logAnimal // 允许，因为 Logger<Animal> 是 Logger<Dog> 的子类型
```

## 符号（Symbols）和迭代器（Iterators）

### 符号（Symbols）

Symbol 是一种基本数据类型，表示唯一的标识符。

```typescript
const sym1 = Symbol('key')
const sym2 = Symbol('key')

console.log(sym1 === sym2) // false
```

Symbols 可用作对象属性的键。

```typescript
const sym = Symbol()

let obj = {
  [sym]: 'value'
}

console.log(obj[sym]) // "value"
```

### 迭代器（Iterators）

迭代器允许我们定义对象的自定义迭代行为。

```typescript
class NumberRange implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    // 实现Symbol.iterator方法，返回一个迭代器对象
    let current = this.start; // 初始化当前值为起始值
    const end = this.end; // 结束值为设定的结束值
    return {
      next(): IteratorResult<number> {
        // 实现next方法，返回迭代结果对象
        if (current <= end) {
          // 如果当前值小于等于结束值
          return { value: current++, done: false }; // 返回当前值并将当前值加一，迭代未结束
        } else {
          return { value: null, done: true }; // 返回空值，迭代结束
        }
      }
    }
  }
}

for (const num of new NumberRange(1, 5)) {
  console.log(num) // 输出 1, 2, 3, 4, 5
}
```
### 类型兼容性

TypeScript 使用结构类型系统。如果两个对象具有相同的形状，它们就被认为是相同的类型。

```typescript
interface Point {
  x: number
  y: number
}

let p: Point = { x: 10, y: 20 }
let p2 = { x: 1, y: 2, z: 3 }

p = p2 // 允许，因为 p2 包含 Point 所需的所有属性
```

实际业务场景：在开发一个地图应用时，您可能需要处理不同来源的坐标数据。有些数据源可能提供额外的信息（如高度），但您的应用只需要 x 和 y 坐标。类型兼容性允许您使用这些"超集"对象，而不需要显式地去除多余的属性。

## 协变和逆变

协变和逆变是描述类型转换后的兼容性的概念。

### 协变（Covariance）

如果 A 是 B 的子类型，那么 T<A> 也是 T<B> 的子类型。

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

let animals: Animal[] = []
let dogs: Dog[] = []

animals = dogs // 允许，因为 Dog[] 是 Animal[] 的子类型
```

实际业务场景：在开发一个宠物管理系统时，您可能有一个显示动物列表的组件。该组件接受 `Animal[]` 类型的输入。由于协变，您可以直接传入 `Dog[]` 或 `Cat[]`，而不需要进行类型转换，这使得代码更加灵活和可复用。

### 逆变（Contravariance）

如果 A 是 B 的子类型，那么 T<B> 是 T<A> 的子类型。这在函数参数中常见。

```typescript
type Logger<T> = (param: T) => void

let logAnimal: Logger<Animal> = animal => console.log(animal.name)
let logDog: Logger<Dog> = dog => console.log(dog.breed)

logDog = logAnimal // 允许，因为 Logger<Animal> 是 Logger<Dog> 的子类型
```

实际业务场景：在开发一个日志系统时，您可能有一个通用的日志函数来记录不同类型的事件。逆变允许您使用更通用的日志函数（如 `logAnimal`）来替代更具体的日志函数（如 `logDog`），这提高了代码的灵活性和可维护性。

## 符号（Symbols）和迭代器（Iterators）

### 符号（Symbols）

Symbol 是一种基本数据类型，表示唯一的标识符。

```typescript
const sym1 = Symbol('key')
const sym2 = Symbol('key')

console.log(sym1 === sym2) // false
```

Symbols 可用作对象属性的键。

```typescript
const sym = Symbol()

let obj = {
  [sym]: 'value'
}

console.log(obj[sym]) // "value"
```

实际业务场景：在开发一个大型应用时，您可能需要为某些对象添加元数据，但又不想这些元数据被意外访问或修改。使用 Symbol 作为键可以创建非枚举的、唯一的属性，适合存储内部使用的元数据。

### 迭代器（Iterators）

迭代器允许我们定义对象的自定义迭代行为。

```typescript
class NumberRange implements Iterable<number> {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start
    const end = this.end
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false }
        } else {
          return { value: null, done: true }
        }
      }
    }
  }
}

for (const num of new NumberRange(1, 5)) {
  console.log(num) // 输出 1, 2, 3, 4, 5
}
```

实际业务场景：在开发一个数据分析工具时，您可能需要处理大量的数据集。使用迭代器可以实现惰性计算，只在需要时才生成下一个值。这对于处理大型数据集或无限序列特别有用，可以显著提高性能和内存效率。例如，您可以创建一个 `DateRange` 迭代器，用于生成两个日期之间的所有日期，而不需要一次性在内存中存储所有日期。