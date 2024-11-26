# JavaScript 闭包（Closure）

## 基础概念

闭包是函数和其词法环境的组合，这个环境包含了这个函数创建时所能访问的所有局部变量。换句话说，闭包让你可以从内部函数访问外部函数的作用域。

### 词法作用域示例
```javascript
function init() {
  const name = 'Mozilla';  // name 是一个被 init 创建的局部变量
  
  function displayName() { // displayName() 是内部函数，一个闭包
    console.log(name);     // 使用了父函数声明的变量
  }
  
  displayName();
}

init(); // 输出: Mozilla
```

### 闭包的基本形式
```javascript
function createCounter() {
  let count = 0;  // 私有变量
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
```

## 闭包的原理

### 1. 作用域链
闭包通过作用域链来访问外部变量：
```javascript
function outer(x) {
  return function(y) {
    return function(z) {
      // 可以访问所有外层作用域的变量
      return x + y + z;
    };
  };
}

const add1 = outer(1);     // 创建第一层闭包
const add2 = add1(2);      // 创建第二层闭包
console.log(add2(3));      // 6 - 访问所有外层变量
```

### 2. 垃圾回收
闭包会保持对外部变量的引用，阻止垃圾回收：
```javascript
function createLeak() {
  const largeData = new Array(1000000);
  
  return function() {
    // 即使只使用了一个元素，整个数组仍然被保留
    console.log(largeData[0]);
  };
}

// 避免内存泄漏的写法
function avoidLeak() {
  const largeData = new Array(1000000);
  const firstItem = largeData[0];
  
  return function() {
    // 只保留需要的数据
    console.log(firstItem);
  };
}
```

## 常见应用场景

### 1. 数据私有化
```javascript
function createPerson(name) {
  let age = 0;  // 私有变量
  
  return {
    getName() {
      return name;
    },
    setAge(newAge) {
      if (typeof newAge === 'number' && newAge >= 0) {
        age = newAge;
      }
    },
    getAge() {
      return age;
    }
  };
}

const person = createPerson('John');
person.setAge(25);
console.log(person.getAge());  // 25
console.log(person.age);       // undefined
```

### 2. 函数工厂
```javascript
function multiply(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### 3. 模块模式
```javascript
const calculator = (function() {
  // 私有变量和函数
  let result = 0;
  
  function validate(num) {
    return typeof num === 'number';
  }
  
  // 公共 API
  return {
    add(num) {
      if (validate(num)) {
        result += num;
      }
      return this;
    },
    subtract(num) {
      if (validate(num)) {
        result -= num;
      }
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

calculator.add(5).subtract(2);
console.log(calculator.getResult()); // 3
```

### 4. 事件处理和回调
```javascript
function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const handleSearch = debounce(function(query) {
  console.log('Searching for:', query);
}, 300);

// 使用示例
input.addEventListener('input', e => handleSearch(e.target.value));
```

### 5. 柯里化
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
```

## 闭包陷阱和最佳实践

### 1. 循环中的闭包
```javascript
// 常见错误
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000); // 输出三次 3
}

// 正确方式 1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000); // 输出 0, 1, 2
}

// 正确方式 2：使用 IIFE
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(() => console.log(index), 1000);
  })(i);
}
```

### 2. 内存管理
```javascript
function createCache() {
  const cache = new Map();
  
  return {
    add(key, value) {
      cache.set(key, value);
    },
    get(key) {
      return cache.get(key);
    },
    clear() {
      cache.clear(); // 提供清理机制
    }
  };
}

const cache = createCache();
// 使用后清理
cache.clear();
```

### 3. this 绑定
```javascript
const obj = {
  name: 'Object',
  getName() {
    return () => {
      return this.name; // 箭头函数保持外部 this
    };
  },
  getNameFunction() {
    return function() {
      return this.name; // 普通函数 this 指向调用者
    };
  }
};

const arrowFn = obj.getName();
console.log(arrowFn()); // 'Object'

const regularFn = obj.getNameFunction();
console.log(regularFn()); // undefined (在非严格模式下)
```

## 性能考虑

1. 及时清理：当不再需要闭包时，将引用设为 null
2. 最小化闭包范围：只捕获需要的变量
3. 避免在循环中创建闭包（除非必要）
4. 使用 WeakMap/WeakSet 存储对象引用

```javascript
// 好的实践
function createHandler(element) {
  const data = new WeakMap();
  
  return {
    setData(key, value) {
      if (!data.has(element)) {
        data.set(element, new Map());
      }
      data.get(element).set(key, value);
    },
    getData(key) {
      const elementData = data.get(element);
      return elementData ? elementData.get(key) : undefined;
    }
  };
}