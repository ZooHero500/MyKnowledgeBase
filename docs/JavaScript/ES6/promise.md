# Promise

### Promise 状态

Promise 有三种状态：
- `pending`: 初始状态，既不是成功，也不是失败状态
- `fulfilled`: 意味着操作成功完成
- `rejected`: 意味着操作失败

一旦状态改变（从 pending 变为 fulfilled 或 rejected），就不会再改变。

## 基本用法

### 创建 Promise
```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  if (/* 操作成功 */) {
    resolve(value);
  } else {
    reject(error);
  }
});

// 实际示例
function readFileAsync(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

### Promise 链式调用
```javascript
promise
  .then(result => {
    // 处理成功
    return newValue;
  })
  .catch(error => {
    // 处理错误
  })
  .finally(() => {
    // 总是执行
  });

// 实际示例
fetchUserData(userId)
  .then(user => fetchUserPosts(user.id))
  .then(posts => processUserPosts(posts))
  .catch(error => console.error('Error:', error))
  .finally(() => hideLoadingSpinner());
```

## Promise 静态方法

### Promise.all
等待所有 Promise 完成，或任一 Promise 失败
```javascript
const promises = [
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
];

Promise.all(promises)
  .then(([users, posts, comments]) => {
    // 所有请求都成功完成
  })
  .catch(error => {
    // 任一请求失败
  });
```

### Promise.race
返回最先完成的 Promise 结果
```javascript
const timeout = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout')), 5000);
});

const fetchData = fetch('/api/data');

Promise.race([fetchData, timeout])
  .then(data => console.log(data))
  .catch(error => console.error('Error or timeout:', error));
```

### Promise.allSettled
等待所有 Promise 完成（无论成功或失败）
```javascript
const promises = [
  fetch('/api/endpoint1'),
  fetch('/api/endpoint2'),
  fetch('/api/endpoint3')
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('Success:', result.value);
      } else {
        console.log('Error:', result.reason);
      }
    });
  });
```

### Promise.any
返回第一个成功的 Promise
```javascript
const promises = [
  fetch('https://api1.example.com/data'),
  fetch('https://api2.example.com/data'),
  fetch('https://api3.example.com/data')
];

Promise.any(promises)
  .then(firstSuccess => {
    console.log('First successful response:', firstSuccess);
  })
  .catch(error => {
    console.log('All promises failed:', error);
  });
```

## Promise 实现

### 基础版本实现
```javascript
// Promise 的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  // 构造函数接收一个执行回调
  constructor(executor) {
    // 初始化状态
    this.status = PENDING;
    // 成功的值
    this.value = undefined;
    // 失败的原因
    this.reason = undefined;
    // 成功回调函数队列
    this.onFulfilledCallbacks = [];
    // 失败回调函数队列
    this.onRejectedCallbacks = [];

    // resolve 方法
    const resolve = (value) => {
      // 只有 PENDING 状态才能转换为 FULFILLED
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    }

    // reject 方法
    const reject = (reason) => {
      // 只有 PENDING 状态才能转换为 REJECTED
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    }

    try {
      // 立即执行executor
      executor(resolve, reject);
    } catch (error) {
      // 发生异常时执行失败回调
      reject(error);
    }
  }

  // then 方法
  then(onFulfilled, onRejected) {
    // 参数校验，确保一定是函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    // 返回一个新的Promise
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 创建微任务
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === REJECTED) {
        // 创建微任务
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === PENDING) {
        // 将回调存入队列
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  // catch 方法
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // finally 方法
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    );
  }

  // 静态 resolve 方法
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }

  // 静态 reject 方法
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  // 静态 all 方法
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('promises must be an array'));
      }
      const result = [];
      let count = 0;
      
      if (promises.length === 0) {
        resolve(result);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            result[index] = value;
            count++;
            if (count === promises.length) {
              resolve(result);
            }
          },
          reason => {
            reject(reason);
          }
        );
      });
    });
  }

  // 静态 race 方法
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('promises must be an array'));
      }
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 处理 Promise 解析过程
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise2 和 x 指向同一对象，以 TypeError 为据因拒绝执行
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 如果 x 为 Promise，采用其状态
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
    return;
  }

  // 如果 x 为对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false;
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}
```

### 测试用例
```javascript
// 基本功能测试
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
});

promise.then(value => {
  console.log(value); // 1秒后输出 'success'
});

// 链式调用测试
new MyPromise((resolve) => {
  resolve(1);
})
  .then(value => value + 1)
  .then(value => {
    console.log(value); // 输出 2
    return MyPromise.resolve(3);
  })
  .then(value => {
    console.log(value); // 输出 3
  });

// 错误处理测试
new MyPromise((resolve, reject) => {
  reject(new Error('something wrong'));
})
  .catch(error => {
    console.log(error.message); // 输出 'something wrong'
  });

// Promise.all 测试
const p1 = MyPromise.resolve(1);
const p2 = new MyPromise(resolve => setTimeout(() => resolve(2), 1000));
const p3 = MyPromise.resolve(3);

MyPromise.all([p1, p2, p3])
  .then(values => {
    console.log(values); // 1秒后输出 [1, 2, 3]
  });

// Promise.race 测试
const p4 = new MyPromise(resolve => setTimeout(() => resolve(4), 1000));
const p5 = new MyPromise(resolve => setTimeout(() => resolve(5), 500));

MyPromise.race([p4, p5])
  .then(value => {
    console.log(value); // 0.5秒后输出 5
  });
```

### Promise A+ 规范要点

1. Promise 状态
   - Promise 必须处于三种状态之一：pending、fulfilled 或 rejected
   - 当处于 pending 状态时，可以转换到 fulfilled 或 rejected 状态
   - 当处于 fulfilled 或 rejected 状态时，不能转换到其他状态

2. then 方法
   - Promise 必须提供 then 方法访问其当前值或原因
   - then 方法接受两个参数：`promise.then(onFulfilled, onRejected)`
   - onFulfilled 和 onRejected 必须作为函数被调用
   - then 方法可以被同一个 promise 调用多次
   - then 方法必须返回一个 promise

3. Promise 解析过程
   - 不能将 promise 解析为自身
   - 如果解析值是一个 promise，需要采用其状态
   - 如果解析值是一个对象或函数，需要处理其 then 方法

4. 执行顺序
   - onFulfilled 和 onRejected 必须在事件循环的微任务阶段执行

## Promise 设计模式与实现原理

### 涉及的设计模式

#### 1. 观察者模式（Observer Pattern）
Promise 的实现核心使用了观察者模式：
```javascript
class MyPromise {
  constructor(executor) {
    // 观察者队列
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    // resolve 作为发布者通知所有成功观察者
    const resolve = value => {
      this.onFulfilledCallbacks.forEach(callback => callback(value));
    };
    
    // reject 作为发布者通知所有失败观察者
    const reject = reason => {
      this.onRejectedCallbacks.forEach(callback => callback(reason));
    };
  }

  // then 方法用于添加观察者
  then(onFulfilled, onRejected) {
    this.onFulfilledCallbacks.push(onFulfilled);
    this.onRejectedCallbacks.push(onRejected);
  }
}
```

#### 2. 状态机模式（State Pattern）
Promise 对象的状态转换遵循状态机模式：
```javascript
class MyPromise {
  constructor() {
    this.state = 'pending';  // 初始状态
  }

  // 状态只能从 pending 转换到 fulfilled 或 rejected
  transition(newState) {
    if (this.state === 'pending') {
      this.state = newState;
    }
  }
}
```

#### 3. 链式调用模式（Chain of Responsibility）
Promise 的 then 方法实现了链式调用模式：
```javascript
then(onFulfilled, onRejected) {
  // 返回新的 Promise 以支持链式调用
  return new MyPromise((resolve, reject) => {
    // 处理当前 Promise
    const result = onFulfilled(this.value);
    // 传递给下一个 Promise
    resolve(result);
  });
}
```

### 核心实现原理

#### 1. 异步任务队列
Promise 使用了事件循环中的微任务队列（Microtask Queue）来处理异步操作：
```javascript
then(onFulfilled) {
  queueMicrotask(() => {
    // 确保在下一个微任务中执行回调
    const result = onFulfilled(this.value);
  });
}
```

#### 2. 状态管理
Promise 实现了严格的状态管理机制：
- 状态只能从 pending 转换到 fulfilled 或 rejected
- 状态转换后不可再变更
- 状态和值都是不可变的（Immutable）

#### 3. 错误传播机制
Promise 实现了统一的错误处理和传播机制：
```javascript
then(onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    try {
      // 尝试执行成功回调
      const result = onFulfilled(this.value);
      resolve(result);
    } catch (error) {
      // 捕获所有错误并传播
      reject(error);
    }
  });
}
```