# ES6+ 新特性

## 数组新增方法

### ES5
- `forEach`: 遍历数组
- `map`: 映射数组
- `filter`: 过滤数组
- `reduce`: 归并数组
- `some`: 是否存在满足条件的元素
- `every`: 是否所有元素都满足条件
- `indexOf`: 查找元素索引
- `lastIndexOf`: 查找元素最后出现的索引

### ES6+
- `find`: 查找满足条件的第一个元素
- `findIndex`: 查找满足条件的第一个元素的索引
- `includes`: 是否包含指定元素
- `from`: 类数组转数组
- `of`: 创建数组
- `fill`: 填充数组
- `copyWithin`: 复制数组的一部分到同一数组中的另一个位置

### ES2016+
- `flat`: 数组扁平化
- `flatMap`: 映射并扁平化
- `at`: 支持负数索引的访问方法

## 对象新增方法

### Object.assign
合并多个对象的属性到目标对象
```javascript
// 基本用法
const target = { a: 1 };
const source = { b: 2 };
Object.assign(target, source);  // { a: 1, b: 2 }

// 多个源对象
const result = Object.assign({}, obj1, obj2, obj3);

// 常见用途
// 1. 复制对象
const clone = Object.assign({}, original);

// 2. 为对象添加方法
Object.assign(SomeClass.prototype, {
  newMethod() {},
  anotherMethod() {}
});

// 3. 设置默认值
const config = Object.assign({
  host: 'localhost',
  port: 3000,
  timeout: 5000
}, userConfig);
```

### Object.keys/values/entries
```javascript
const obj = { a: 1, b: 2, c: 3 };

// keys: 获取所有键
Object.keys(obj);  // ['a', 'b', 'c']

// values: 获取所有值
Object.values(obj);  // [1, 2, 3]

// entries: 获取所有键值对
Object.entries(obj);  // [['a', 1], ['b', 2], ['c', 3]]

// 常见用途
// 1. 遍历对象
Object.entries(obj).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// 2. 对象转Map
const map = new Map(Object.entries(obj));

// 3. 过滤对象属性
const filtered = Object.fromEntries(
  Object.entries(obj).filter(([key, value]) => value > 1)
);
```

### Object.fromEntries
键值对数组转回对象
```javascript
// 基本用法
const entries = [['a', 1], ['b', 2]];
Object.fromEntries(entries);  // { a: 1, b: 2 }

// 常见用途
// 1. Map转对象
const map = new Map([['a', 1], ['b', 2]]);
const obj = Object.fromEntries(map);

// 2. 对象转换
const obj = { a: 1, b: 2, c: 3 };
const result = Object.fromEntries(
  Object.entries(obj)
    .map(([key, value]) => [key, value * 2])
);  // { a: 2, b: 4, c: 6 }

// 3. URL 参数转对象
const params = Object.fromEntries(new URLSearchParams('foo=bar&baz=qux'));
// { foo: 'bar', baz: 'qux' }
```

### Object.getOwnPropertyDescriptors
获取对象所有属性的完整描述符
```javascript
const obj = { 
  get name() { return 'John' },
  age: 30
};

const descriptors = Object.getOwnPropertyDescriptors(obj);
/*
{
  name: {
    get: [Function: get name],
    set: undefined,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: true,
    enumerable: true,
    configurable: true
  }
}
*/

// 常见用途
// 1. 复制 getter/setter
const clone = Object.defineProperties({}, 
  Object.getOwnPropertyDescriptors(obj)
);

// 2. 属性代理
const proxy = new Proxy(obj, {
  get(target, prop) {
    const descriptor = Object.getOwnPropertyDescriptor(target, prop);
    if (descriptor.get) {
      return descriptor.get.call(target);
    }
    return target[prop];
  }
});
```

### Object.hasOwn
安全的属性检查方法
```javascript
const obj = { prop: undefined };

// 旧方法的问题
obj.hasOwnProperty('prop');  // true，但如果 hasOwnProperty 被覆盖就不安全
'prop' in obj;  // true，但会检查原型链

// Object.hasOwn 更安全
Object.hasOwn(obj, 'prop');  // true
Object.hasOwn(obj, 'toString');  // false，不检查原型链

// 常见用途
// 1. 安全的属性检查
if (Object.hasOwn(obj, 'prop')) {
  // 使用 obj.prop
}

// 2. 过滤对象自有属性
const ownProps = Object.entries(obj)
  .filter(([key]) => Object.hasOwn(obj, key));
```

## 字符串新增方法

### ES6
- `startsWith`: 是否以指定字符串开头
- `endsWith`: 是否以指定字符串结尾
- `includes`: 是否包含指定字符串
- `repeat`: 重复字符串
- `padStart`: 头部补全
- `padEnd`: 尾部补全

### ES2017+
- `trimStart`: 去除头部空格
- `trimEnd`: 去除尾部空格
- `replaceAll`: 替换所有匹配项

## 新增数据结构

### Map/WeakMap
```javascript
const map = new Map();
map.set('key', 'value');
map.get('key');
map.has('key');
map.delete('key');
```

### Set/WeakSet
```javascript
const set = new Set([1, 2, 3]);
set.add(4);
set.has(4);
set.delete(4);
```

## 新增语法

### 可选链
```javascript
const name = user?.profile?.name;
const first = arr?.[0];
const result = func?.();
```

### 空值合并
```javascript
const name = user.name ?? 'Anonymous';
const count = data.count ?? 0;
```

### 逻辑赋值
```javascript
x ||= y;  // x = x || y
x &&= y;  // x = x && y
x ??= y;  // x = x ?? y
```

## Promise 新增方法

### ES6
- `Promise.all`: 所有都完成
- `Promise.race`: 竞速，第一个完成的结果

### ES2017+
- `Promise.allSettled`: 所有都结束，无论成功失败
- `Promise.any`: 任意一个完成
- `Promise.prototype.finally`: 无论成功失败都执行
