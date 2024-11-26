# JavaScript 函数式编程

函数式编程是一种编程范式，强调使用纯函数进行软件开发，避免共享状态和可变数据。

## 核心概念

### 纯函数

纯函数具有以下特征：
1. 相同输入始终得到相同输出
2. 无副作用
3. 不依赖外部状态

```javascript
// 纯函数
const add = (a, b) => a + b;

// 非纯函数
let count = 0;
const increment = () => ++count;
```

### 不可变性

不直接修改数据，而是返回新的数据副本。

```javascript
// 不推荐
const numbers = [1, 2, 3];
numbers.push(4);

// 推荐
const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4];
```

### 高阶函数

接收或返回函数的函数。

```javascript
// 函数作为参数
const map = (arr, fn) => arr.map(fn);

// 返回函数
const multiply = x => y => x * y;
const double = multiply(2);
```

## 常用函数式操作

### map / filter / reduce

```javascript
const numbers = [1, 2, 3, 4, 5];

// map: 转换数组元素
const doubled = numbers.map(x => x * 2);

// filter: 过滤数组元素
const evens = numbers.filter(x => x % 2 === 0);

// reduce: 归约数组元素
const sum = numbers.reduce((acc, cur) => acc + cur, 0);
```

### 函数组合

将多个函数组合成一个函数。

```javascript
// 基础组合函数
const compose = (...fns) => x => 
    fns.reduceRight((acc, fn) => fn(acc), x);

// 使用示例
const addOne = x => x + 1;
const double = x => x * 2;
const addOneThenDouble = compose(double, addOne);

addOneThenDouble(3); // 8
```

### 柯里化

将多参数函数转换为一系列单参数函数。

```javascript
// 柯里化函数
const curry = fn => {
    const arity = fn.length;
    return function curried(...args) {
        if (args.length >= arity) {
            return fn(...args);
        }
        return (...moreArgs) => curried(...args, ...moreArgs);
    };
};

// 使用示例
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
```

## 函数式编程工具库

### Lodash/FP
```javascript
import { compose, map, filter } from 'lodash/fp';

const processNumbers = compose(
    filter(x => x > 2),
    map(x => x * 2)
);
```

### Ramda
```javascript
import { compose, map, filter } from 'ramda';

const processNumbers = compose(
    filter(x => x > 2),
    map(x => x * 2)
);
```

## 实际应用

### 状态管理
```javascript
// Redux reducer 示例
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                ...state,
                todos: [...state.todos, action.payload]
            };
        default:
            return state;
    }
};
```

### 数据转换
```javascript
const transformData = compose(
    filter(item => item.active),
    map(item => ({
        id: item.id,
        name: item.name.toUpperCase()
    })),
    sortBy('name')
);
```

## 性能优化

### 记忆化
```javascript
// 未使用记忆化的斐波那契函数
const fib = n => n <= 1 ? n : fib(n - 1) + fib(n - 2);

// 使用记忆化后的斐波那契函数
const memoizedFib = memoize(n => n <= 1 ? n : memoizedFib(n - 1) + memoizedFib(n - 2));

// 性能对比
console.time('Without memoization');
fib(40);              // 可能需要几秒钟
console.timeEnd('Without memoization');

console.time('With memoization');
memoizedFib(40);      // 几乎立即返回
console.timeEnd('With memoization');

// 记忆化原理解析
const expensiveOperation = x => {
    console.log('Computing...');
    return x * 2;
};

const memoizedOperation = memoize(expensiveOperation);

memoizedOperation(5);  // 输出: Computing... 10
memoizedOperation(5);  // 直接返回: 10 (不会再次计算)
```

### 惰性求值
```javascript
// 传统的立即求值
const eagerRange = (start, end) => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
};

// 惰性求值版本
const lazyRange = function* (start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
};

// 使用示例
const numbers = eagerRange(1, 1000000);  // 立即创建一个大数组
const lazyNumbers = lazyRange(1, 1000000);  // 不会立即创建数组

// 惰性求值的优势
const findFirst = (predicate, iterable) => {
    for (const item of iterable) {
        if (predicate(item)) {
            return item;
        }
    }
};

// 立即求值：计算所有值
const firstEvenEager = findFirst(
    x => x % 2 === 0,
    eagerRange(1, 1000000)  // 创建完整数组
);

// 惰性求值：只计算到找到第一个符合条件的值
const firstEvenLazy = findFirst(
    x => x % 2 === 0,
    lazyRange(1, 1000000)  // 只生成到找到 2 为止
);
```

## 最佳实践

1. **保持函数纯净**
   - 避免修改外部状态
   - 避免副作用
   - 确保可预测性

2. **使用不可变数据**
   - 使用展开运算符
   - 使用 Object.assign()
   - 使用不可变数据库

3. **组合优于继承**
   - 使用函数组合
   - 避免深层继承
   - 保持代码模块化
