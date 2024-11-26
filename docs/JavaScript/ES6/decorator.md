# JavaScript 装饰器（Decorators）

装饰器是一种特殊的声明，可以附加到类声明、方法、属性或参数上，用于修改它们的行为。

## 基本概念

装饰器是一个函数，它接收特定的参数并返回相同类型的值或新的描述符。

### 装饰器类型

1. **类装饰器**
```javascript
@logged
class Example {
  // ...
}

// 装饰器实现
function logged(target) {
  console.log(`Creating instance of ${target.name}`);
  return target;
}
```

2. **方法装饰器**
```javascript
class Example {
  @readonly
  method() {
    // ...
  }
}

function readonly(target, propertyKey, descriptor) {
  descriptor.writable = false;
  return descriptor;
}
```

3. **属性装饰器**
```javascript
class Example {
  @nonenumerable
  property = 'value';
}

function nonenumerable(target, propertyKey) {
  Object.defineProperty(target, propertyKey, {
    enumerable: false
  });
}
```

4. **访问器装饰器**
```javascript
class Example {
  @configurable(false)
  get property() {
    return this._property;
  }
}

function configurable(value) {
  return function (target, propertyKey, descriptor) {
    descriptor.configurable = value;
    return descriptor;
  };
}
```

## 常用装饰器模式

### 1. 日志装饰器

```javascript
function log(target, name, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with:`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}
```

### 2. 性能监控装饰器

```javascript
function measure(target, name, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    const start = performance.now();
    const result = original.apply(this, args);
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  };
  
  return descriptor;
}
```

### 3. 缓存装饰器

```javascript
function memoize(target, name, descriptor) {
  const original = descriptor.value;
  const cache = new Map();
  
  descriptor.value = function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  
  return descriptor;
}
```

### 4. 防抖装饰器

```javascript
function debounce(delay) {
  return function(target, name, descriptor) {
    const original = descriptor.value;
    let timeout;
    
    descriptor.value = function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        original.apply(this, args);
      }, delay);
    };
    
    return descriptor;
  };
}
```

## 高级用法

### 1. 组合装饰器

```javascript
@logged
@singleton
class Service {
  // ...
}

// 装饰器从下到上执行
// 先执行 singleton，再执行 logged
```

### 2. 参数化装饰器

```javascript
function validate(schema) {
  return function(target, propertyKey, descriptor) {
    const original = descriptor.value;
    
    descriptor.value = function(...args) {
      const valid = schema.validate(args);
      if (!valid) {
        throw new Error('Invalid parameters');
      }
      return original.apply(this, args);
    };
    
    return descriptor;
  };
}
```

### 3. 依赖注入装饰器

```javascript
const Injectable = () => {
  return function(target) {
    target.injectable = true;
  };
};

@Injectable()
class UserService {
  // ...
}
```

## 最佳实践

1. **保持装饰器的单一职责**
```javascript
// 好的做法
@logged
@validated
@cached
class Service {}

// 避免
@complexDecorator
class Service {}
```

2. **使用工厂函数创建可配置的装饰器**
```javascript
function timeout(ms) {
  return function(target, key, descriptor) {
    // ...
  };
}

class Example {
  @timeout(1000)
  async method() {}
}
```

3. **注意装饰器的执行顺序**
```javascript
@dec1
@dec2
class Example {
  @dec3
  @dec4
  method() {}
}
// 执行顺序：dec2 -> dec1 -> dec4 -> dec3
```

## 浏览器兼容性

- 装饰器目前是 Stage 3 提案
- 需要使用 Babel 或 TypeScript 进行转译
- 主流浏览器原生支持还在进行中

## 常见问题和解决方案

1. **this 绑定问题**
```javascript
function log(target, name, descriptor) {
  const original = descriptor.value;
  
  // 使用箭头函数保持 this 上下文
  descriptor.value = (...args) => {
    console.log(`Calling ${name}`);
    return original.apply(this, args);
  };
  
  return descriptor;
}
```

2. **装饰器执行时机**
```javascript
// 装饰器在类定义时执行，而不是实例化时
@logged
class Example {
  constructor() {
    console.log('Constructor');
  }
}
// logged 装饰器先执行
// 然后才是 constructor
```

3. **属性描述符的处理**
```javascript
function readonly(target, name, descriptor) {
  // 确保返回有效的属性描述符
  return {
    ...descriptor,
    writable: false,
    configurable: false
  };
}
``` 