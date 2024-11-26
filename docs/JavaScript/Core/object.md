# JavaScript 面向对象编程

## 面向对象三大特性

### 1. 封装（Encapsulation）

封装是将数据和操作数据的方法绑定在一起，对外部隐藏具体实现细节的机制。

#### 传统封装（闭包实现）
```javascript
function Counter() {
  // 私有变量
  let count = 0;

  // 私有方法
  function validate(value) {
    return typeof value === 'number' && value >= 0;
  }

  // 公共接口
  this.increment = function() {
    count++;
    return count;
  };

  this.decrement = function() {
    if (count > 0) {
      count--;
    }
    return count;
  };

  this.getCount = function() {
    return count;
  };

  this.setCount = function(value) {
    if (validate(value)) {
      count = value;
    }
  };
}

const counter = new Counter();
counter.increment();      // 1
counter.count;           // undefined (私有变量无法直接访问)
counter.getCount();      // 1
```

#### 现代封装（类私有字段）
```javascript
class BankAccount {
  #balance = 0;  // 私有字段
  #transactions = [];  // 私有字段

  constructor(initialBalance) {
    if (initialBalance > 0) {
      this.#balance = initialBalance;
      this.#addTransaction('initial', initialBalance);
    }
  }

  // 公共方法
  deposit(amount) {
    if (this.#validateAmount(amount)) {
      this.#balance += amount;
      this.#addTransaction('deposit', amount);
      return true;
    }
    return false;
  }

  withdraw(amount) {
    if (this.#validateAmount(amount) && this.#validateBalance(amount)) {
      this.#balance -= amount;
      this.#addTransaction('withdraw', amount);
      return true;
    }
    return false;
  }

  getBalance() {
    return this.#balance;
  }

  // 私有方法
  #validateAmount(amount) {
    return typeof amount === 'number' && amount > 0;
  }

  #validateBalance(amount) {
    return this.#balance >= amount;
  }

  #addTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      date: new Date()
    });
  }
}

const account = new BankAccount(1000);
account.deposit(500);    // true
account.#balance;        // SyntaxError: Private field
account.getBalance();    // 1500
```

### 2. 继承（Inheritance）

继承允许创建一个类作为另一个类的扩展，实现代码重用和建立类型层次结构。

#### 原型链继承
```javascript
// 基类
function Vehicle(brand) {
  this.brand = brand;
  this.running = false;
}

Vehicle.prototype.start = function() {
  this.running = true;
  console.log(`${this.brand} is starting...`);
};

Vehicle.prototype.stop = function() {
  this.running = false;
  console.log(`${this.brand} is stopping...`);
};

// 派生类
function Car(brand, model) {
  // 调用父类构造函数
  Vehicle.call(this, brand);
  this.model = model;
}

// 建立原型链
Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

// 扩展方法
Car.prototype.honk = function() {
  console.log('Beep! Beep!');
};

// 重写方法
Car.prototype.start = function() {
  // 调用父类方法
  Vehicle.prototype.start.call(this);
  console.log(`${this.model} is ready to go!`);
};

const car = new Car('Toyota', 'Camry');
car.start();  // "Toyota is starting..." "Camry is ready to go!"
car.honk();   // "Beep! Beep!"
```

#### 类继承（ES6+）
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }

  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }

  // 重写方法
  speak() {
    console.log(`${this.name} barks`);
  }

  // 扩展方法
  fetch() {
    console.log(`${this.name} is fetching the ball`);
  }
}

const dog = new Dog('Max', 'Labrador');
dog.speak();  // "Max barks"
dog.eat();    // "Max is eating"
dog.fetch();  // "Max is fetching the ball"
```

### 3. 多态（Polymorphism）

多态允许使用统一的接口处理不同类型的对象，实现更灵活的代码设计。

#### 接口多态
```javascript
// 定义统一接口
class Shape {
  area() {
    throw new Error('area() must be implemented');
  }

  perimeter() {
    throw new Error('perimeter() must be implemented');
  }
}

// 实现接口的不同类
class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }

  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}

// 多态使用
function calculateArea(shape) {
  if (shape instanceof Shape) {
    return shape.area();
  }
  throw new Error('Parameter must be a Shape');
}

const rect = new Rectangle(5, 3);
const circle = new Circle(3);

console.log(calculateArea(rect));   // 15
console.log(calculateArea(circle)); // 28.27...
```

#### 函数多态（重载模拟）
```javascript
class Calculator {
  add(...args) {
    // 根据参数数量和类型提供不同实现
    if (args.length === 0) return 0;
    
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        return args[0].reduce((sum, num) => sum + num, 0);
      }
      return args[0];
    }

    return args.reduce((sum, num) => sum + num, 0);
  }
}

const calc = new Calculator();
console.log(calc.add());           // 0
console.log(calc.add(5));          // 5
console.log(calc.add([1,2,3]));    // 6
console.log(calc.add(1,2,3));      // 6
```

### 面向对象实践示例

下面是一个综合运用封装、继承和多态的实例：

```javascript
// 基础用户接口
class User {
  #id;
  #name;
  #email;

  constructor(id, name, email) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
  }

  // 封装：通过方法访问私有属性
  getName() { return this.#name; }
  getEmail() { return this.#email; }

  // 多态：不同类型用户有不同的问候语
  greet() {
    return `Hello, I'm ${this.#name}`;
  }

  // 多态：不同类型用户有不同的权限
  hasAccess(resource) {
    return false;
  }
}

// 管理员用户
class Admin extends User {
  #role;

  constructor(id, name, email) {
    super(id, name, email);
    this.#role = 'admin';
  }

  greet() {
    return `Hello, I'm admin ${this.getName()}`;
  }

  hasAccess(resource) {
    return true;  // 管理员有所有权限
  }
}

// 普通用户
class RegularUser extends User {
  #permissions;

  constructor(id, name, email) {
    super(id, name, email);
    this.#permissions = new Set();
  }

  addPermission(permission) {
    this.#permissions.add(permission);
  }

  hasAccess(resource) {
    return this.#permissions.has(resource);
  }
}

// 使用示例
function checkAccess(user, resource) {
  if (user.hasAccess(resource)) {
    console.log(`${user.getName()} has access to ${resource}`);
  } else {
    console.log(`${user.getName()} does not have access to ${resource}`);
  }
}

const admin = new Admin(1, 'John', 'john@example.com');
const user = new RegularUser(2, 'Jane', 'jane@example.com');

user.addPermission('documents');

console.log(admin.greet());  // "Hello, I'm admin John"
console.log(user.greet());   // "Hello, I'm Jane"

checkAccess(admin, 'settings');  // "John has access to settings"
checkAccess(user, 'documents');  // "Jane has access to documents"
checkAccess(user, 'settings');   // "Jane does not have access to settings"
```

## 对象基础

### 1. 对象创建方式

#### 对象字面量
```javascript
const person = {
  name: 'John',
  age: 30,
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};
```

#### 构造函数
```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.sayHello = function() {
    console.log(`Hello, I'm ${this.name}`);
  };
}

const person = new Person('John', 30);
```

#### Object.create()
```javascript
const personProto = {
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

const person = Object.create(personProto);
person.name = 'John';
person.age = 30;
```

#### ES6 Class
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
```

### 2. 属性描述符

#### 数据描述符
```javascript
const person = {};

Object.defineProperty(person, 'name', {
  value: 'John',
  writable: true,     // 是否可修改
  enumerable: true,   // 是否可枚举
  configurable: true  // 是否可配置
});

// 多个属性
Object.defineProperties(person, {
  name: {
    value: 'John',
    writable: true
  },
  age: {
    value: 30,
    writable: false
  }
});
```

#### 访问器描述符
```javascript
const person = {
  firstName: 'John',
  lastName: 'Doe'
};

Object.defineProperty(person, 'fullName', {
  get() {
    return `${this.firstName} ${this.lastName}`;
  },
  set(value) {
    [this.firstName, this.lastName] = value.split(' ');
  }
});

person.fullName = 'Jane Smith';
console.log(person.firstName); // 'Jane'
```

## 原型与原型链

### 1. 原型基础

#### 原型关系
```javascript
function Person(name) {
  this.name = name;
}

// 构造函数、原型对象和实例的关系
Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('John');

console.log(person.__proto__ === Person.prototype);        // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Person.prototype.constructor === Person);      // true
```

#### 原型链查找
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('John');

// 属性查找过程
console.log(person.hasOwnProperty('name'));     // true
console.log(person.hasOwnProperty('sayHello')); // false
console.log('sayHello' in person);              // true
```

### 2. 继承实现

#### 原型链继承
```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white'];
}

Animal.prototype.sayName = function() {
  console.log(this.name);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.bark = function() {
  console.log('Woof!');
};

const dog = new Dog('Max', 'Labrador');
dog.sayName(); // 'Max'
dog.bark();    // 'Woof!'
```

#### Class 继承
```javascript
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['black', 'white'];
  }

  sayName() {
    console.log(this.name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  bark() {
    console.log('Woof!');
  }
}

const dog = new Dog('Max', 'Labrador');
```

### 3. 混入（Mixin）模式

#### 对象混入
```javascript
const speakerMixin = {
  speak() {
    console.log(`${this.name} is speaking`);
  }
};

const walkerMixin = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

// 使用 Object.assign 混入多个对象的方法
class Person {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(Person.prototype, speakerMixin, walkerMixin);

const person = new Person('John');
person.speak(); // "John is speaking"
person.walk();  // "John is walking"
```

#### 函数式混入
```javascript
function mixinSpeaker(Base) {
  return class extends Base {
    speak() {
      console.log(`${this.name} is speaking`);
    }
  };
}

function mixinWalker(Base) {
  return class extends Base {
    walk() {
      console.log(`${this.name} is walking`);
    }
  };
}

class Person {
  constructor(name) {
    this.name = name;
  }
}

// 组合多个 mixin
const EnhancedPerson = mixinWalker(mixinSpeaker(Person));
const person = new EnhancedPerson('John');
```

## 面向对象设计模式

### 1. 工厂模式
```javascript
function createPerson(name, age, job) {
  return {
    name,
    age,
    job,
    sayHello() {
      console.log(`Hello, I'm ${this.name}`);
    }
  };
}

const person1 = createPerson('John', 30, 'developer');
const person2 = createPerson('Jane', 25, 'designer');
```

### 2. 单例模式
```javascript
class Singleton {
  constructor() {
    if (!Singleton.instance) {
      this.data = [];
      Singleton.instance = this;
    }
    return Singleton.instance;
  }

  addItem(item) {
    this.data.push(item);
  }
}

// 确保只有一个实例
const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true
```

### 3. 观察者模式
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

const emitter = new EventEmitter();
emitter.on('userCreated', user => console.log('New user:', user));
emitter.emit('userCreated', { name: 'John' });
```

## 最佳实践

### 1. 封装与私有性
```javascript
// 使用闭包实现私有属性
function Person(name) {
  // 私有属性
  let _age = 0;

  // 公共方法
  this.getName = function() {
    return name;
  };

  this.setAge = function(age) {
    if (age >= 0) {
      _age = age;
    }
  };

  this.getAge = function() {
    return _age;
  };
}

// ES2022 私有字段
class ModernPerson {
  #age = 0;  // 私有字段

  constructor(name) {
    this.name = name;
  }

  setAge(age) {
    if (age >= 0) {
      this.#age = age;
    }
  }

  getAge() {
    return this.#age;
  }
}
```

### 2. SOLID 原则应用

#### 单一职责原则
```javascript
// 好的实现
class UserAuth {
  login(credentials) { /* ... */ }
  logout() { /* ... */ }
}

class UserProfile {
  updateProfile(data) { /* ... */ }
  getProfile(userId) { /* ... */ }
}

// 而不是
class User {
  login() { /* ... */ }
  logout() { /* ... */ }
  updateProfile() { /* ... */ }
  getProfile() { /* ... */ }
}
```

#### 开放/封闭原则
```javascript
class Shape {
  area() {
    throw new Error('area() must be implemented');
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}
```