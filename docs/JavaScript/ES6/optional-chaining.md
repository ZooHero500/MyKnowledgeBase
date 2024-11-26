# JavaScript 可选链操作符（Optional Chaining）

可选链操作符（`?.`）允许我们在访问对象的属性时，安全地处理可能为 `null` 或 `undefined` 的情况。

## 基本用法

### 1. 对象属性访问

```javascript
const user = {
  name: 'John',
  address: {
    street: 'Main St'
  }
};

// 传统方式
const zipCode = user && user.address && user.address.zipCode;

// 使用可选链
const zipCode = user?.address?.zipCode;  // undefined
```

### 2. 方法调用

```javascript
const user = {
  name: 'John',
  getAddress() {
    return '123 Main St';
  }
};

// 安全调用方法
const address = user?.getAddress?.();  // '123 Main St'

// 如果方法不存在
const phone = user?.getPhone?.();  // undefined
```

### 3. 数组元素访问

```javascript
const users = [
  { name: 'John' },
  { name: 'Jane' }
];

// 安全访问数组元素
const firstUser = users?.[0]?.name;  // 'John'
const thirdUser = users?.[2]?.name;  // undefined
```

## 高级用法

### 1. 与解构结合

```javascript
const user = null;

// 安全解构
const { name, address: { street } = {} } = user ?? {};

// 使用可选链
const street = user?.address?.street;
```

### 2. 与函数参数结合

```javascript
function processUser(user) {
  // 检查嵌套属性
  const city = user?.address?.city;
  
  // 调用可选的回调函数
  user?.callback?.({
    processed: true
  });
}
```

### 3. 与表达式结合

```javascript
const users = {
  admin: {
    role: 'admin',
    permissions: ['read', 'write']
  }
};

const userType = 'admin';
const canWrite = users[userType]?.permissions?.includes('write');  // true
```

## 实际应用场景

### 1. API 响应处理

```javascript
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    
    // 安全访问嵌套数据
    const userCity = data?.user?.address?.city;
    const userPhone = data?.user?.contacts?.phone;
    
    return {
      city: userCity,
      phone: userPhone
    };
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 2. 事件处理

```javascript
function handleEvent(event) {
  // 安全访问事件属性
  const clientX = event?.touches?.[0]?.clientX ?? event?.clientX;
  const clientY = event?.touches?.[0]?.clientY ?? event?.clientY;
  
  return { x: clientX, y: clientY };
}
```

### 3. 配置对象处理

```javascript
function initializeApp(config) {
  // 使用默认值
  const apiUrl = config?.api?.url ?? 'https://api.default.com';
  const timeout = config?.api?.timeout ?? 5000;
  
  return {
    apiUrl,
    timeout
  };
}
```

## 最佳实践

### 1. 合理使用可选链

```javascript
// 好的做法：处理可能不存在的属性
const userCity = user?.address?.city;

// 不必要的使用：确定存在的属性
const userName = user?.name;  // 如果 user 一定存在，直接用 user.name
```

### 2. 与空值合并操作符结合

```javascript
const config = {
  theme: {
    dark: false
  }
};

// 提供默认值
const isDarkMode = config?.theme?.dark ?? false;
const fontSize = config?.theme?.fontSize ?? '16px';
```

### 3. 避免过度链式

```javascript
// 避免过长的链式调用
const value = obj?.prop1?.prop2?.prop3?.prop4?.prop5;

// 建议拆分或重构
const intermediate = obj?.prop1?.prop2;
const value = intermediate?.prop3?.prop4?.prop5;
```

## 性能考虑

### 1. 短路求值

```javascript
// 可选链会在遇到 null 或 undefined 时立即返回 undefined
const value = obj?.a?.b?.c;  // 如果 obj 是 null，不会继续评估后续属性
```

### 2. 缓存中间结果

```javascript
// 如果多次使用相同的链式访问，考虑缓存中间结果
const userAddress = user?.address;  // 缓存中间结果
const street = userAddress?.street;
const city = userAddress?.city;
const country = userAddress?.country;
```

## 常见问题和解决方案

### 1. 与类型检查结合

```javascript
function processData(data) {
  // 类型检查与可选链结合
  if (typeof data?.process === 'function') {
    return data.process();
  }
  
  // 提供默认行为
  return null;
}
```

### 2. 处理数组方法

```javascript
const items = null;

// 安全调用数组方法
const firstItem = items?.filter(item => item.active)?.[0];
const mappedItems = items?.map(item => item.name) ?? [];
```

### 3. 异步方法调用

```javascript
async function fetchData(api) {
  try {
    // 安全调用异步方法
    const data = await api?.fetchUser?.() ?? { error: 'API not available' };
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

## 浏览器兼容性

- 现代浏览器都支持可选链操作符
- 对于旧版浏览器，需要使用 Babel 等工具转译
- 可以使用 polyfill 或回退到传统的 && 操作符