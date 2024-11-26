# JavaScript Async/Await

`async/await` 是 JavaScript 中处理异步操作的一种方式，它建立在 Promise 之上，提供了更直观的语法来处理异步代码。

## 基本概念

### async 函数

`async` 函数总是返回一个 Promise。函数内部的返回值会被自动包装成 Promise。

```javascript
async function getData() {
  return 'data';  // 等同于 return Promise.resolve('data')
}

getData().then(data => console.log(data));  // 输出: data
```

### await 表达式

`await` 操作符用于等待 Promise 完成，只能在 async 函数内部使用。

```javascript
async function fetchUserData() {
  const response = await fetch('https://api.example.com/user');
  const data = await response.json();
  return data;
}
```

## 错误处理

### 1. try/catch 方式

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;  // 可以选择重新抛出错误
  }
}
```

### 2. Promise 链式处理

```javascript
async function fetchData() {
  const data = await fetch('https://api.example.com/data')
    .then(response => response.json())
    .catch(error => {
      console.error('Error:', error);
      return null;  // 提供默认值
    });
  
  return data;
}
```

## 并发处理

### 1. Promise.all

同时执行多个异步操作，等待所有操作完成。

```javascript
async function fetchMultipleData() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('One of the requests failed:', error);
  }
}
```

### 2. Promise.race

等待多个异步操作中最先完成的一个。

```javascript
async function fetchWithTimeout() {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  );
  
  try {
    const response = await Promise.race([
      fetch('https://api.example.com/data'),
      timeout
    ]);
    return await response.json();
  } catch (error) {
    console.error('Request failed or timed out:', error);
  }
}
```

### 3. Promise.allSettled

等待所有 Promise 完成，无论成功或失败。

```javascript
async function fetchAllData() {
  const results = await Promise.allSettled([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Request ${index} succeeded:`, result.value);
    } else {
      console.log(`Request ${index} failed:`, result.reason);
    }
  });
}
```

## 高级用法

### 1. 异步迭代器

```javascript
async function* asyncGenerator() {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

async function processItems() {
  for await (const item of asyncGenerator()) {
    console.log(item);  // 每秒输出一个数字
  }
}
```

### 2. 递归异步操作

```javascript
async function fetchAllPages(url, page = 1, allData = []) {
  const response = await fetch(`${url}?page=${page}`);
  const { data, hasMore } = await response.json();
  
  const newData = [...allData, ...data];
  
  if (hasMore) {
    return fetchAllPages(url, page + 1, newData);
  }
  
  return newData;
}
```

### 3. 自定义异步操作

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processWithDelay() {
  console.log('Start');
  await delay(2000);
  console.log('After 2 seconds');
  await delay(1000);
  console.log('After 3 seconds');
}
```

## 性能优化

### 1. 避免串行执行

```javascript
// 不好的做法
async function fetchSequential() {
  const user = await fetchUser();
  const posts = await fetchPosts();  // 等待 user 完成后才开始
  return { user, posts };
}

// 好的做法
async function fetchParallel() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  return { user, posts };
}
```

### 2. 缓存 Promise

```javascript
class DataService {
  constructor() {
    this.cache = new Map();
  }
  
  async getData(key) {
    if (!this.cache.has(key)) {
      this.cache.set(key, this.fetchData(key));
    }
    return this.cache.get(key);
  }
  
  async fetchData(key) {
    // 实际的数据获取逻辑
  }
}
```

## 最佳实践

### 1. 合理使用 async/await

```javascript
// 不需要 await 的情况
async function unnecessary() {
  return await Promise.resolve('data');  // 不需要 await
}

// 正确的做法
async function better() {
  return Promise.resolve('data');
}
```

### 2. 正确的错误处理

```javascript
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return await data.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // 处理网络错误
    } else if (error instanceof SyntaxError) {
      // 处理 JSON 解析错误
    } else {
      // 处理其他错误
    }
    throw error;
  }
}
```

### 3. 保持代码可读性

```javascript
// 使用适当的函数分解
async function processUserData(userId) {
  const user = await fetchUser(userId);
  const enrichedUser = await enrichUserData(user);
  const result = await saveUser(enrichedUser);
  return result;
}

// 而不是
async function processUserData(userId) {
  return saveUser(
    await enrichUserData(
      await fetchUser(userId)
    )
  );
}
```

## 常见问题和解决方案

### 1. 循环中的异步操作

```javascript
// 串行执行
async function processSequential(items) {
  for (const item of items) {
    await processItem(item);  // 一个接一个执行
  }
}

// 并行执行
async function processParallel(items) {
  const promises = items.map(item => processItem(item));
  await Promise.all(promises);  // 同时执行所有
}
```

### 2. 条件性异步执行

```javascript
async function conditionalFetch(condition) {
  const data = condition
    ? await fetch('/api/data')
    : await fetch('/api/alternative');
    
  return data.json();
}
```

### 3. 异步初始化

```javascript
class AsyncService {
  static instance = null;
  static async getInstance() {
    if (!AsyncService.instance) {
      const instance = new AsyncService();
      await instance.init();
      AsyncService.instance = instance;
    }
    return AsyncService.instance;
  }
  
  async init() {
    // 异步初始化逻辑
  }
}