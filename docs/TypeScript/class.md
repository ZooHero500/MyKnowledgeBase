# 类

## 简介

TypeScript 中的类是一种面向对象编程的核心概念，它提供了一种结构化和组织代码的方式。类可以看作是创建对象的模板，定义了对象的属性和方法。

## 类的定义和实例化

### 基本定义

````typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hello, my name is ${this.name} and I'm ${this.age} years old.`);
  }
}

const john = new Person("John", 30);
john.greet(); // 输出: Hello, my name is John and I'm 30 years old.
````


## 继承

继承允许我们基于现有的类创建新的类，复用代码并建立类之间的层次结构。

````typescript
class Employee extends Person {
  jobTitle: string;

  constructor(name: string, age: number, jobTitle: string) {
    super(name, age);
    this.jobTitle = jobTitle;
  }

  work() {
    console.log(`${this.name} is working as a ${this.jobTitle}.`);
  }
}

const jane = new Employee("Jane", 28, "Developer");
jane.greet(); // 从 Person 类继承的方法
jane.work(); // Employee 类的新方法
````


## 公共、私有和受保护的修饰符

TypeScript 提供了访问修饰符来控制类成员的可见性。

````typescript
class BankAccount {
  public accountHolder: string;
  private balance: number;
  protected accountNumber: string;

  constructor(accountHolder: string, initialBalance: number) {
    this.accountHolder = accountHolder;
    this.balance = initialBalance;
    this.accountNumber = Math.random().toString(36).substr(2, 9);
  }

  public deposit(amount: number) {
    this.balance += amount;
  }

  private calculateInterest(): number {
    return this.balance * 0.05;
  }

  protected getAccountDetails(): string {
    return `Account Number: ${this.accountNumber}, Balance: ${this.balance}`;
  }
}

const account = new BankAccount("Alice", 1000);
account.deposit(500); // 公共方法可以访问
// account.balance; // 错误：'balance' 是私有的
// account.calculateInterest(); // 错误：'calculateInterest' 是私有的
// account.getAccountDetails(); // 错误：'getAccountDetails' 是受保护的
````


## 抽象类

抽象类是一种不能被直接实例化的类，通常用作其他类的基类。

````typescript
abstract class Shape {
  abstract getArea(): number;

  printArea() {
    console.log(`The area is: ${this.getArea()}`);
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

const circle = new Circle(5);
circle.printArea(); // 输出: The area is: 78.53981633974483
````


## 类与接口

类可以实现一个或多个接口，确保类遵循特定的结构。

````typescript
interface Printable {
  print(): void;
}

interface Loggable {
  log(message: string): void;
}

class Printer implements Printable, Loggable {
  print() {
    console.log("Printing...");
  }

  log(message: string) {
    console.log(`Log: ${message}`);
  }
}

const printer = new Printer();
printer.print(); // 输出: Printing...
printer.log("Document processed"); // 输出: Log: Document processed
````
