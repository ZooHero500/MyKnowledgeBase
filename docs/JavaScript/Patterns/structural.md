# JavaScript 结构型设计模式

结构型模式关注如何组合对象和类以形成更大的结构，同时保持结构的灵活性和高效性。

## 适配器模式 (Adapter Pattern)

### 业务场景：第三方库整合

#### 场景描述
需要整合两个不同的数据格式或 API 接口。

```javascript
// 原有的数据格式
const oldAPI = {
  getUser: () => ({
    firstName: 'John',
    lastName: 'Doe',
    age: 30
  })
};

// 新的数据格式要求
class UserAdapter {
  constructor(oldAPI) {
    this.api = oldAPI;
  }

  getUserData() {
    const user = this.api.getUser();
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      age: user.age
    };
  }
}

// 使用适配器
const adapter = new UserAdapter(oldAPI);
const userData = adapter.getUserData();
```

## 装饰器模式 (Decorator Pattern)

### 业务场景：功能增强

#### 场景描述
在不修改原有代码的情况下，为对象添加新的功能。

```javascript
// 基础日志类
class Logger {
  log(message) {
    console.log(message);
  }
}

// 时间戳装饰器
class TimestampDecorator {
  constructor(logger) {
    this.logger = logger;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.logger.log(`[${timestamp}] ${message}`);
  }
}

// 错误级别装饰器
class ErrorLevelDecorator {
  constructor(logger) {
    this.logger = logger;
  }

  log(message) {
    this.logger.log(`[ERROR] ${message}`);
  }
}

// 使用装饰器
const logger = new Logger();
const timestampLogger = new TimestampDecorator(logger);
const errorLogger = new ErrorLevelDecorator(timestampLogger);

errorLogger.log('Something went wrong!');
// 输出: [ERROR] [2023-12-25T10:30:00.000Z] Something went wrong!
```

## 代理模式 (Proxy Pattern)

### 业务场景：数据访问控制

#### 场景描述
控制对某个对象的访问，如延迟加载、访问控制、日志记录等。

```javascript
// 原始图片加载
class ImageLoader {
  loadImage(url) {
    console.log(`Loading image from ${url}`);
    // 实际加载图片的逻辑
  }
}

// 代理类
class ImageProxy {
  constructor() {
    this.imageLoader = new ImageLoader();
    this.cache = new Map();
  }

  loadImage(url) {
    if (this.cache.has(url)) {
      console.log(`Loading image from cache: ${url}`);
      return this.cache.get(url);
    }

    const image = this.imageLoader.loadImage(url);
    this.cache.set(url, image);
    return image;
  }
}

// 使用代理
const imageProxy = new ImageProxy();
imageProxy.loadImage('example.jpg');
```

## 外观模式 (Facade Pattern)

### 业务场景：复杂系统接口简化

#### 场景描述
为复杂的子系统提供一个简单的接口。

```javascript
// 复杂子系统
class AudioAPI {
  start() { /* ... */ }
  stop() { /* ... */ }
}

class VideoAPI {
  play() { /* ... */ }
  pause() { /* ... */ }
}

class DisplayAPI {
  turnOn() { /* ... */ }
  turnOff() { /* ... */ }
}

// 外观类
class MultimediaFacade {
  constructor() {
    this.audio = new AudioAPI();
    this.video = new VideoAPI();
    this.display = new DisplayAPI();
  }

  startPlayback() {
    this.display.turnOn();
    this.audio.start();
    this.video.play();
  }

  stopPlayback() {
    this.video.pause();
    this.audio.stop();
    this.display.turnOff();
  }
}

// 使用外观模式
const player = new MultimediaFacade();
player.startPlayback();
player.stopPlayback();
```

## 组合模式 (Composite Pattern)

### 业务场景：树形结构管理

#### 场景描述
处理树形结构的数据，如文件系统、组织架构等。

```javascript
// 组件接口
class FileSystemComponent {
  constructor(name) {
    this.name = name;
  }

  display(indent = 0) {
    console.log(' '.repeat(indent) + this.name);
  }
}

// 文件类
class File extends FileSystemComponent {
  constructor(name, size) {
    super(name);
    this.size = size;
  }

  display(indent = 0) {
    console.log(' '.repeat(indent) + `${this.name} (${this.size}bytes)`);
  }
}

// 文件夹类
class Directory extends FileSystemComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    this.children.push(component);
  }

  display(indent = 0) {
    console.log(' '.repeat(indent) + `${this.name}/`);
    this.children.forEach(child => child.display(indent + 2));
  }
}

// 使用组合模式
const root = new Directory('root');
const docs = new Directory('docs');
const file1 = new File('readme.md', 1000);
const file2 = new File('config.json', 500);

root.add(docs);
docs.add(file1);
docs.add(file2);

root.display();
```

## 最佳实践

1. **选择合适的模式**
   - 适配器模式：用于接口不兼容的情况
   - 装饰器模式：需要动态添加功能时
   - 代理模式：需要控制对象访问时
   - 外观模式：简化复杂系统接口时
   - 组合模式：处理树形结构数据时

2. **注意事项**
   - 避免过度使用设计模式
   - 保持代码简单和可维护性
   - 考虑性能影响
   - 注意模式的适用场景
