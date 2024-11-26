# JavaScript Classes

ES6 引入的 `class` 语法为 JavaScript 提供了一种更清晰、更面向对象的方式来创建对象和实现继承。

## 基本语法

### 类的定义

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

const person = new Person('John', 30);
person.sayHello(); // 输出: Hello, I'm John
```

### 类的特点

1. **类声明不会提升**
```javascript
// 会报错
const p = new Person(); 
class Person {}
```

2. **类中的代码自动运行在严格模式下**
```javascript
class Example {
  method() {
    // 这里自动是严格模式
  }
}
```

3. **类的方法不可枚举**
```javascript
class Example {
  method() {}
}
console.log(Object.keys(Example.prototype)); // []
```

## 类的组成部分

### 1. 构造方法 (Constructor)

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}
```

- 每个类只能有一个构造方法
- 如果没有显式定义，会自动添加一个空的构造方法
- 用于初始化实例属性

### 2. 实例方法

```javascript
class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
}
```

### 3. 静态方法和属性

```javascript
class MathUtils {
  static PI = 3.14159;
  
  static square(x) {
    return x * x;
  }
}

console.log(MathUtils.PI);      // 3.14159
console.log(MathUtils.square(4)); // 16
```

### 4. 私有字段和方法

```javascript
class BankAccount {
  #balance = 0;  // 私有字段
  
  #validateAmount(amount) {  // 私有方法
    return amount > 0;
  }
  
  deposit(amount) {
    if (this.#validateAmount(amount)) {
      this.#balance += amount;
      return true;
    }
    return false;
  }
  
  getBalance() {
    return this.#balance;
  }
}
```

### 5. Getter 和 Setter

```javascript
class Circle {
  #radius = 0;
  
  constructor(radius) {
    this.radius = radius; // 这里会调用 setter
  }
  
  get radius() {
    return this.#radius;
  }
  
  set radius(value) {
    if (value >= 0) {
      this.#radius = value;
    }
  }
  
  get area() {
    return Math.PI * this.#radius * this.#radius;
  }
}
```

## 继承

### 基本继承

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name); // 必须先调用 super()
  }
  
  speak() {
    console.log(`${this.name} barks.`);
  }
}

const dog = new Dog('Rex');
dog.speak(); // 输出: Rex barks.
```

### 继承注意事项

1. **super 关键字**
```javascript
class Child extends Parent {
  constructor() {
    super(); // 在访问 this 之前必须调用
    this.name = 'child';
  }
  
  method() {
    super.parentMethod(); // 调用父类方法
  }
}
```

2. **继承静态成员**
```javascript
class Parent {
  static parentMethod() {
    return 'parent';
  }
}

class Child extends Parent {}

console.log(Child.parentMethod()); // 'parent'
```

## 高级特性

### 1. Mixin 模式

```javascript
const SpeakerMixin = {
  speak() {
    console.log(`${this.name} is speaking`);
  }
};

const WalkerMixin = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

class Person {
  constructor(name) {
    this.name = name;
  }
}

// 将 mixin 方法添加到原型
Object.assign(Person.prototype, SpeakerMixin, WalkerMixin);

const person = new Person('John');
person.speak(); // John is speaking
person.walk();  // John is walking
```

### 2. 抽象类模拟

```javascript
class AbstractClass {
  constructor() {
    if (new.target === AbstractClass) {
      throw new Error('Cannot instantiate abstract class');
    }
  }
  
  abstractMethod() {
    throw new Error('Abstract method must be implemented');
  }
}

class ConcreteClass extends AbstractClass {
  abstractMethod() {
    console.log('Implementation provided');
  }
}
```

## 最佳实践

1. **使用私有字段确保封装**
```javascript
class User {
  #password;
  
  setPassword(password) {
    this.#password = this.#hashPassword(password);
  }
  
  #hashPassword(password) {
    // 密码哈希实现
    return password;
  }
}
```

2. **合理使用 getter/setter**
```javascript
class Circle {
  #radius;
  
  set radius(value) {
    if (value < 0) throw new Error('Radius cannot be negative');
    this.#radius = value;
  }
  
  get area() {
    return Math.PI * this.#radius ** 2;
  }
}
```

3. **避免深层继承**
```javascript
// 避免这样的深层继承
class A extends B extends C extends D {} // 不推荐

// 使用组合替代
class Component {
  constructor() {
    this.renderer = new Renderer();
    this.dataStore = new DataStore();
  }
}
```

## 性能考虑

1. **原型方法 vs 实例方法**
```javascript
// 推荐：方法定义在原型上
class Good {
  method() {}
}

// 不推荐：每个实例都创建一个新方法
class Bad {
  constructor() {
    this.method = () => {};
  }
}
```

2. **合理使用私有字段**
```javascript
class OptimizedClass {
  // 只将真正需要私有的字段声明为私有
  #sensitiveData;
  publicData;
}
```

## 浏览器兼容性

- 基本的类语法（ES2015）在所有现代浏览器中都得到支持
- 私有字段（#）需要较新的浏览器版本
- 静态私有字段和方法支持度较低

## 常见问题和解决方案

1. **this 绑定问题**
```javascript
class Button {
  constructor() {
    this.clicked = false;
    // 解决方案1：箭头函数
    this.onClick = () => {
      this.clicked = true;
    };
    // 解决方案2：构造函数中绑定
    this.onClickAlt = this.onClickAlt.bind(this);
  }
  
  onClickAlt() {
    this.clicked = true;
  }
}
```

2. **继承内置类型**
```javascript
class MyArray extends Array {
  first() {
    return this[0];
  }
  
  last() {
    return this[this.length - 1];
  }
}
```

3. **实现单例模式**
```javascript
class Singleton {
  static #instance;
  
  constructor() {
    if (Singleton.#instance) {
      return Singleton.#instance;
    }
    Singleton.#instance = this;
  }
  
  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
}