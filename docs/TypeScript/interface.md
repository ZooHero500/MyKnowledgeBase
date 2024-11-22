# 接口

## 简介

接口是 TypeScript 中一个强大的特性，它定义了对象的结构和契约。可以把接口想象成一个蓝图或者规范，它描述了一个对象应该有哪些属性和方法，但不包含具体实现。

## 接口的定义和使用

### 基本定义

````typescript
interface Person {
  name: string;
  age: number;
}

function greet(person: Person) {
  console.log(`Hello, ${person.name}!`);
}

const john: Person = { name: "John", age: 30 };
greet(john);
````


### 可选属性和只读属性

````typescript
interface Car {
  brand: string;
  model: string;
  year?: number;  // 可选属性
  readonly vin: string;  // 只读属性
}

const myCar: Car = {
  brand: "Toyota",
  model: "Corolla",
  vin: "1HGBH41JXMN109186"
};

// myCar.vin = "ABCDEFG";  // 错误：无法分配到 "vin" ，因为它是只读属性。
````


## 函数类型接口

函数类型接口定义了函数的结构，包括参数类型和返回值类型。

````typescript
interface MathFunc {
  (x: number, y: number): number;
}

const add: MathFunc = (a, b) => a + b;
const multiply: MathFunc = (a, b) => a * b;
````


## 类类型接口

类类型接口定义了类应该遵循的结构。

````typescript
interface Printable {
  print(): void;
}

class Book implements Printable {
  constructor(private title: string) {}

  print() {
    console.log(`Printing: ${this.title}`);
  }
}

const myBook = new Book("TypeScript Guide");
myBook.print();  // 输出: Printing: TypeScript Guide
````


## 继承接口

接口可以相互继承，这允许我们从一个接口复制成员到另一个接口，更灵活地将接口分离到可重用的组件中。

````typescript
interface Shape {
  color: string;
}

interface Square extends Shape {
  sideLength: number;
}

const square: Square = {
  color: "blue",
  sideLength: 10
};
````


## 实际应用场景

1. API 契约：定义后端 API 的请求和响应结构。
2. 配置对象：为复杂的配置对象定义结构。
3. 依赖注入：在依赖注入系统中定义服务接口。
4. 插件系统：定义插件应该实现的方法和属性。
