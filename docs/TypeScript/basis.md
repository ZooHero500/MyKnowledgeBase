# 基础

## 简介

TypeScript 是啥？简单来说，它就是 JavaScript 的升级版。想象一下，如果 JavaScript 是一辆普通自行车，那 TypeScript 就是一辆带有辅助轮和安全帽的高级自行车。它让你写代码更安全，更不容易出错，而且还能帮你提前发现一些潜在的问题。

重点在于：`约束`

专业点说，TypeScript 是微软开发的一种开源编程语言，它是 JavaScript 的超集，添加了可选的静态类型和基于类的面向对象编程等特性。TypeScript 通过编译转换成纯 JavaScript，可以在任何支持 JavaScript 的平台上运行。

一些简单的例子：

1. 类型注解：

```typescript
let message: string = "Hello， TypeScript!"
let count: number = 10
let isActive: boolean = true
```

2. 接口定义：

```typescript
interface User {
  name: string
  age: number
}

function greet(user: User) {
  console.log(`你好， ${user.name}!`)
}
```

3. 类：

```typescript
class Animal {
  name: string

  constructor(name: string) {
    this.name = name
  }

  makeSound(): void {
    console.log("动物发出声音")
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log("汪汪!")
  }
}
```

## 安装和配置

要开始使用 TypeScript，你需要先安装它。最简单的方法是通过 npm（Node.js 包管理器）来安装：

1. 全局安装：

```bash
npm install -g typescript
```

2. 在项目中安装：

```bash
npm init -y
npm install --save-dev typescript
```

安装完成后，你可以使用`tsc`命令来编译 TypeScript 文件：

```bash
tsc your-file.ts
```

为了更好地配置 TypeScript 项目，你可以创建一个`tsconfig.json`文件：

```bash
tsc --init
```

这将生成一个带有默认设置的配置文件，你可以根据需要进行修改。

## 基本类型

TypeScript 支持以下基本类型：

1. 布尔值：

```typescript
let isDone: boolean = false
```

2. 数字：

```typescript
let decimal: number = 6
let hex: number = 0xf00d
let binary: number = 0b1010
let octal: number = 0o744
```

3. 字符串：

```typescript
let color: string = "blue"
let sentence: string = `The color is ${color}.`
```

4. 数组：

```typescript
let list: number[] = [1， 2， 3]
let fruits: Array<string> = ["apple"， "banana"， "orange"]
```

5. 元组：

```typescript
let x: [string， number] = ["hello"， 10]
```

6. 枚举：

```typescript
enum Color {Red， Green， Blue}
let c: Color = Color.Green
```

7. Any：

```typescript
let notSure: any = 4
notSure = "maybe a string instead"
```

8. Void：

```typescript
function warnUser(): void {
  console.log("This is a warning message")
}
```

9. Null 和 Undefined：

```typescript
let u: undefined = undefined
let n: null = null
```

## 变量声明

TypeScript 支持`var`、 `let`和`const`关键字来声明变量：

```typescript
var oldWay = "使用var（不推荐）"
let newWay = "使用let声明可变变量"
const constant = "使用const声明常量"
```

推荐使用`let`和`const`，因为它们提供了块级作用域，有助于避免一些常见的编程错误。

## 类型推断和类型断言

TypeScript 能够根据上下文自动推断变量的类型：

```typescript
let x = 3 // TypeScript会推断x的类型为number
let arr = [1, 2, 3] // TypeScript会推断arr的类型为number[]
let obj = { name: "John", age: 30 } // TypeScript会推断obj的类型为{ name: string, age: number }
```

类型推断在很多情况下都能正确工作，但有时候你可能比 TypeScript 更了解某个值的类型。这时可以使用类型断言：

```typescript
// 基本用法
let someValue: any = "this is a string"
let strLength: number = (someValue as string).length

// 在元组中使用
let tuple: [string, number] = ["hello", 10]
let str: string = tuple[0] as string
let num: number = tuple[1] as number

// 在数组中使用
let arr: any[] = ["apple", "banana", "orange"]
let fruit: string = arr[0] as string

// 在枚举中使用
enum Color {Red, Green, Blue}
let colorName: string = Color[0] as string

// 在对象中使用
interface Person {
  name: string
  age: number
}
let obj: any = { name: "John", age: 30 }
let person: Person = obj as Person

// 在函数返回值中使用
function getData(): any {
  return "some data"
}
let data: string = getData() as string

// 在联合类型中使用
let value: string | number = "hello"
let length: number = (value as string).length
```

类型断言有两种形式：

1. 尖括号语法：

```typescript
let strLength: number = (<string>someValue).length
```

2. as 语法：

```typescript
let strLength: number = (someValue as string).length
```

推荐使用 as 语法，因为它在 JSX 中不会产生歧义。

需要注意的是，类型断言不是类型转换，它不会在运行时改变变量的类型。类型断言只是告诉编译器你更了解这个值的类型，应该按照你断言的类型来处理它。

在实际应用中，类型断言常用于以下场景：
1. 处理 DOM 元素
2. 处理第三方库返回的值
3. 在你确定一个联合类型中的具体类型时
4. 在类型缩小（Type Narrowing）的场景中

总之，类型推断和类型断言是 TypeScript 中非常有用的特性，它们可以帮助你写出更加安全和可维护的代码。但是要注意，过度使用类型断言可能会导致类型安全性降低，所以应该谨慎使用。