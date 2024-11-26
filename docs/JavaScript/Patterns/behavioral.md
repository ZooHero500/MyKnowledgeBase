# JavaScript 行为型设计模式

行为型模式关注对象之间的通信，处理对象之间的职责分配和算法抽象。

## 观察者模式 (Observer Pattern)

### 业务场景：事件处理系统

#### 场景描述
实现一个事件处理系统，允许对象订阅和发布事件。

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);
  }

  emit(eventName, data) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => callback(data));
    }
  }

  off(eventName, callback) {
    if (this.events.has(eventName)) {
      const callbacks = this.events.get(eventName);
      this.events.set(eventName, callbacks.filter(cb => cb !== callback));
    }
  }
}

// 使用示例
const eventBus = new EventEmitter();

const handler = data => console.log('Received:', data);
eventBus.on('userLogin', handler);
eventBus.emit('userLogin', { userId: 123 });
```

## 策略模式 (Strategy Pattern)

### 业务场景：表单验证

#### 场景描述
实现一个灵活的表单验证系统，可以动态切换验证规则。

```javascript
// 验证策略
const validationStrategies = {
  required: value => value.trim() !== '' ? null : '此字段是必填的',
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : '请输入有效的邮箱地址',
  minLength: min => value => 
    value.length >= min ? null : `最少需要${min}个字符`,
  maxLength: max => value => 
    value.length <= max ? null : `最多允许${max}个字符`
};

class FormValidator {
  constructor(validations) {
    this.validations = validations;
  }

  validate(formData) {
    const errors = {};
    
    Object.keys(this.validations).forEach(field => {
      const fieldValidations = this.validations[field];
      const value = formData[field];
      
      fieldValidations.forEach(validation => {
        if (typeof validation === 'function') {
          const error = validation(value);
          if (error) {
            errors[field] = errors[field] || [];
            errors[field].push(error);
          }
        }
      });
    });

    return errors;
  }
}

// 使用示例
const validator = new FormValidator({
  username: [
    validationStrategies.required,
    validationStrategies.minLength(3)
  ],
  email: [
    validationStrategies.required,
    validationStrategies.email
  ]
});

const formData = {
  username: 'jo',
  email: 'invalid-email'
};

const errors = validator.validate(formData);
```

## 命令模式 (Command Pattern)

### 业务场景：撤销重做功能

#### 场景描述
实现一个带有撤销重做功能的文本编辑器。

```javascript
// 命令接口
class TextCommand {
  execute() {}
  undo() {}
}

// 具体命令
class InsertTextCommand extends TextCommand {
  constructor(editor, text) {
    super();
    this.editor = editor;
    this.text = text;
    this.position = editor.getCurrentPosition();
  }

  execute() {
    this.editor.insert(this.text, this.position);
  }

  undo() {
    this.editor.delete(this.position, this.text.length);
  }
}

class DeleteTextCommand extends TextCommand {
  constructor(editor, length) {
    super();
    this.editor = editor;
    this.position = editor.getCurrentPosition();
    this.deletedText = editor.getText(this.position, length);
  }

  execute() {
    this.editor.delete(this.position, this.deletedText.length);
  }

  undo() {
    this.editor.insert(this.deletedText, this.position);
  }
}

// 编辑器类
class TextEditor {
  constructor() {
    this.content = '';
    this.cursor = 0;
    this.history = [];
    this.redoStack = [];
  }

  executeCommand(command) {
    command.execute();
    this.history.push(command);
    this.redoStack = []; // 清空重做栈
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.history.push(command);
    }
  }

  // 编辑器基本操作
  insert(text, position) {
    this.content = this.content.slice(0, position) + 
                  text + 
                  this.content.slice(position);
    this.cursor = position + text.length;
  }

  delete(position, length) {
    this.content = this.content.slice(0, position) + 
                  this.content.slice(position + length);
    this.cursor = position;
  }

  getCurrentPosition() {
    return this.cursor;
  }

  getText(position, length) {
    return this.content.slice(position, position + length);
  }
}

// 使用示例
const editor = new TextEditor();
editor.executeCommand(new InsertTextCommand(editor, 'Hello'));
editor.executeCommand(new InsertTextCommand(editor, ' World'));
console.log(editor.content); // "Hello World"
editor.undo();
console.log(editor.content); // "Hello"
editor.redo();
console.log(editor.content); // "Hello World"
```

## 状态模式 (State Pattern)

### 业务场景：任务状态管理

#### 场景描述
管理任务在不同状态之间的转换。

```javascript
// 状态接口
class TaskState {
  constructor(task) {
    this.task = task;
  }
  
  start() {}
  pause() {}
  complete() {}
  reopen() {}
}

// 具体状态类
class PendingState extends TaskState {
  start() {
    this.task.setState(new InProgressState(this.task));
    console.log('Task started');
  }
}

class InProgressState extends TaskState {
  pause() {
    this.task.setState(new PausedState(this.task));
    console.log('Task paused');
  }
  
  complete() {
    this.task.setState(new CompletedState(this.task));
    console.log('Task completed');
  }
}

class PausedState extends TaskState {
  start() {
    this.task.setState(new InProgressState(this.task));
    console.log('Task resumed');
  }
}

class CompletedState extends TaskState {
  reopen() {
    this.task.setState(new InProgressState(this.task));
    console.log('Task reopened');
  }
}

// 任务类
class Task {
  constructor(name) {
    this.name = name;
    this.state = new PendingState(this);
  }

  setState(state) {
    this.state = state;
  }

  start() { this.state.start(); }
  pause() { this.state.pause(); }
  complete() { this.state.complete(); }
  reopen() { this.state.reopen(); }
}

// 使用示例
const task = new Task('Implement feature');
task.start();    // Task started
task.pause();    // Task paused
task.start();    // Task resumed
task.complete(); // Task completed
task.reopen();   // Task reopened
```

## 迭代器模式 (Iterator Pattern)

### 业务场景：自定义集合遍历

#### 场景描述
实现一个自定义集合的遍历器。

```javascript
class CustomCollection {
  constructor() {
    this.items = [];
  }

  add(item) {
    this.items.push(item);
  }

  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;

    return {
      next() {
        return {
          done: index >= items.length,
          value: items[index++]
        };
      }
    };
  }
}

// 使用示例
const collection = new CustomCollection();
collection.add('Item 1');
collection.add('Item 2');
collection.add('Item 3');

for (const item of collection) {
  console.log(item);
}
```

## 最佳实践

1. **选择合适的模式**
   - 观察者模式：用于事件驱动的系统
   - 策略模式：需要动态切换算法时
   - 命令模式：需要操作的撤销/重做功能
   - 状态模式：对象状态转换复杂时
   - 迭代器模式：需要统一遍历接口时

2. **注意事项**
   - 避免过度设计
   - 保持代码可读性
   - 考虑模式的性能影响
   - 注意内存泄漏问题
