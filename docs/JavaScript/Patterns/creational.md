# JavaScript 创建型设计模式

创建型模式关注对象的创建机制，试图以合适的方式创建对象以解决实际问题。

## 单例模式 (Singleton Pattern)

### 业务场景：全局状态管理

#### 场景描述
在一个大型 SPA 应用中，需要管理用户的登录状态、主题配置等全局状态。

#### 不使用模式
```javascript
// 组件 A
let userState = {
  isLoggedIn: false,
  userInfo: null
};

// 组件 B
let userState = {
  isLoggedIn: true, // 状态不同步！
  userInfo: { name: 'John' }
};
```

#### 使用模式
```javascript
class UserStore {
  static instance = null;
  
  constructor() {
    if (UserStore.instance) {
      return UserStore.instance;
    }
    this.isLoggedIn = false;
    this.userInfo = null;
    UserStore.instance = this;
  }

  login(userInfo) {
    this.isLoggedIn = true;
    this.userInfo = userInfo;
  }

  logout() {
    this.isLoggedIn = false;
    this.userInfo = null;
  }
}

// 使用
const userStore = new UserStore();
export default userStore;
```

#### 好处
1. 保证状态的全局唯一性
2. 避免状态不同步
3. 集中管理，易于维护

### 业务场景：WebSocket 连接管理

#### 场景描述
实时通讯应用需要维护与服务器的 WebSocket 连接。

#### 不使用模式
```javascript
// 组件 A
const ws1 = new WebSocket('ws://example.com');

// 组件 B
const ws2 = new WebSocket('ws://example.com'); // 创建了重复连接！
```

#### 使用模式
```javascript
class WebSocketManager {
  static instance = null;
  
  constructor() {
    if (WebSocketManager.instance) {
      return WebSocketManager.instance;
    }
    this.ws = null;
    this.connected = false;
    WebSocketManager.instance = this;
  }

  connect() {
    if (!this.ws) {
      this.ws = new WebSocket('ws://example.com');
      this.setupListeners();
    }
    return this.ws;
  }

  private setupListeners() {
    this.ws.onopen = () => {
      this.connected = true;
    };
    this.ws.onclose = () => {
      this.connected = false;
    };
  }
}

// 使用
const wsManager = new WebSocketManager();
export default wsManager;
```

#### 好处
1. 避免重复连接
2. 节省系统资源
3. 统一的连接管理

## 工厂模式 (Factory Pattern)

### 业务场景：动态表单控件创建

#### 场景描述
需要根据后端配置动态创建不同类型的表单控件。

#### 不使用模式
```javascript
function createFormControl(type, config) {
  if (type === 'input') {
    const input = document.createElement('input');
    input.type = config.inputType || 'text';
    input.placeholder = config.placeholder || '';
    // ... 更多配置
    return input;
  } else if (type === 'select') {
    const select = document.createElement('select');
    config.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    return select;
  } else if (type === 'datepicker') {
    // ... 日期选择器的创建逻辑
  }
  // ... 更多控件类型
}
```

#### 使用模式
```javascript
// 基础控件类
class FormControl {
  constructor(config) {
    this.config = config;
  }
  render() {
    throw new Error('子类必须实现 render 方法');
  }
}

// 具体控件类
class InputControl extends FormControl {
  render() {
    const input = document.createElement('input');
    input.type = this.config.inputType || 'text';
    input.placeholder = this.config.placeholder || '';
    return input;
  }
}

class SelectControl extends FormControl {
  render() {
    const select = document.createElement('select');
    this.config.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    return select;
  }
}

// 工厂类
class FormControlFactory {
  static createControl(type, config) {
    switch(type) {
      case 'input':
        return new InputControl(config);
      case 'select':
        return new SelectControl(config);
      // ... 更多控件类型
      default:
        throw new Error(`不支持的控件类型: ${type}`);
    }
  }
}

// 使用
const control = FormControlFactory.createControl('input', {
  inputType: 'text',
  placeholder: '请输入...'
});
const element = control.render();
```

#### 好处
1. 解耦了控件的创建和使用
2. 易于扩展新的控件类型
3. 统一的创建接口
4. 集中管理控件的创建逻辑

### 业务场景：API 请求封装

#### 场景描述
需要处理多种类型的 API 请求，每种类型有其特定的处理逻辑。

#### 不使用模式
```javascript
async function makeRequest(type, config) {
  if (type === 'get') {
    // GET 请求处理
    const response = await fetch(config.url);
    return response.json();
  } else if (type === 'post') {
    // POST 请求处理
    const response = await fetch(config.url, {
      method: 'POST',
      body: JSON.stringify(config.data)
    });
    return response.json();
  } else if (type === 'upload') {
    // 文件上传处理
    const formData = new FormData();
    formData.append('file', config.file);
    const response = await fetch(config.url, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}
```

#### 使用模式
```javascript
// 基础请求类
class APIRequest {
  constructor(config) {
    this.config = config;
  }
  async execute() {
    throw new Error('子类必须实现 execute 方法');
  }
}

// 具体请求类
class GetRequest extends APIRequest {
  async execute() {
    const response = await fetch(this.config.url);
    return response.json();
  }
}

class PostRequest extends APIRequest {
  async execute() {
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.config.data)
    });
    return response.json();
  }
}

class UploadRequest extends APIRequest {
  async execute() {
    const formData = new FormData();
    formData.append('file', this.config.file);
    const response = await fetch(this.config.url, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}

// 工厂类
class APIRequestFactory {
  static createRequest(type, config) {
    switch(type) {
      case 'get':
        return new GetRequest(config);
      case 'post':
        return new PostRequest(config);
      case 'upload':
        return new UploadRequest(config);
      default:
        throw new Error(`不支持的请求类型: ${type}`);
    }
  }
}

// 使用
const request = APIRequestFactory.createRequest('post', {
  url: '/api/users',
  data: { name: 'John' }
});
const response = await request.execute();
```

#### 好处
1. 统一的请求接口
2. 易于添加新的请求类型
3. 请求逻辑封装和复用
4. 便于统一处理错误和拦截器

## 建造者模式 (Builder Pattern)

### 业务场景：复杂表单构建

#### 场景描述
需要构建一个包含多个步骤的复杂表单，每个步骤都有其特定的字段和验证规则。

#### 不使用模式
```javascript
class Form {
  constructor(formData) {
    this.personalInfo = {
      name: formData.name,
      age: formData.age,
      email: formData.email
    };
    this.addressInfo = {
      street: formData.street,
      city: formData.city,
      country: formData.country
    };
    this.paymentInfo = {
      cardNumber: formData.cardNumber,
      expiryDate: formData.expiryDate,
      cvv: formData.cvv
    };
    // ... 更多字段
  }
}

// 使用
const form = new Form({
  name: 'John',
  age: 30,
  email: 'john@example.com',
  street: '123 Main St',
  city: 'Boston',
  country: 'USA',
  cardNumber: '1234-5678-9012-3456',
  expiryDate: '12/24',
  cvv: '123'
});
```

#### 使用模式
```javascript
class Form {
  constructor() {
    this.fields = {};
  }

  setField(key, value) {
    this.fields[key] = value;
  }
}

class FormBuilder {
  constructor() {
    this.form = new Form();
  }

  addPersonalInfo(name, age, email) {
    this.form.setField('name', name);
    this.form.setField('age', age);
    this.form.setField('email', email);
    return this;
  }

  addAddressInfo(street, city, country) {
    this.form.setField('street', street);
    this.form.setField('city', city);
    this.form.setField('country', country);
    return this;
  }

  addPaymentInfo(cardNumber, expiryDate, cvv) {
    this.form.setField('cardNumber', cardNumber);
    this.form.setField('expiryDate', expiryDate);
    this.form.setField('cvv', cvv);
    return this;
  }

  validate() {
    // 验证逻辑
    const { name, email, cardNumber } = this.form.fields;
    if (!name || !email || !cardNumber) {
      throw new Error('必填字段不能为空');
    }
    // 更多验证...
    return this;
  }

  build() {
    return this.form;
  }
}

// 使用
const formBuilder = new FormBuilder();
const form = formBuilder
  .addPersonalInfo('John', 30, 'john@example.com')
  .addAddressInfo('123 Main St', 'Boston', 'USA')
  .addPaymentInfo('1234-5678-9012-3456', '12/24', '123')
  .validate()
  .build();
```

#### 好处
1. 分步骤构建复杂对象
2. 可以控制构建过程
3. 支持链式调用
4. 易于添加验证逻辑
5. 提高代码可读性和可维护性

## 最佳实践

1. **选择合适的模式**
   - 单例模式：适用于需要全局唯一的对象
   - 工厂模式：适用于对象创建逻辑复杂或需要统一管理的场景
   - 建造者模式：适用于分步骤构建复杂对象的场景

2. **注意事项**
   - 单例模式要注意线程安全
   - 工厂模式要避免过度设计
   - 建造者模式要控制好构建步骤的顺序

3. **性能考虑**
   - 单例模式：注意内存占用
   - 工厂模式：避免创建过多的类
   - 建造者模式：控制构建过程的复杂度

4. **可维护性**
   - 保持代码结构清晰
   - 添加适当的注释
   - 遵循单一职责原则
