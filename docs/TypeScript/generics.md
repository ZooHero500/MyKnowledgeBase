# 泛型

## 简介

泛型是 TypeScript 中一个强大的特性，它允许我们在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。

泛型可以理解为"类型的参数化"，它提供了一种方式来创建可重用的组件，这些组件可以支持多种数据类型，而不失去类型检查的好处。

关键词：`类型参数化`，`复用`

## 泛型函数

泛型函数允许我们定义一个可以处理多种类型的函数，而不需要为每种类型都写一个函数。

````typescript
function identity<T>(arg: T): T {
    return arg;
}

let output1 = identity<string>("myString");  // 类型为 string
let output2 = identity(123);  // 类型推断为 number
````


## 泛型接口

泛型接口允许我们定义可以使用多种类型的接口。

````typescript
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
````


## 泛型类

泛型类使得类可以支持多种数据类型，增加了类的灵活性和可重用性。

````typescript
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
````


## 泛型约束

泛型约束允许我们限制泛型可以接受的类型，通过 extends 关键字来实现。

````typescript
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // 现在我们知道arg有一个.length属性
    return arg;
}

loggingIdentity({length: 10, value: 3});
````


## 实际应用场景

1. 数据结构实现：如栈、队列、链表等，可以处理不同类型的数据。
2. API 请求封装：创建通用的 HTTP 请求函数，可以处理不同类型的响应数据。
3. 状态管理：在 Redux 或其他状态管理库中定义通用的 action 和 reducer。
4. 组件开发：创建可以接受不同类型 props 的通用 React 组件。
