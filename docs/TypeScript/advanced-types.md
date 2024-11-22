# 高级类型

## 联合类型

联合类型表示一个值可以是几种类型之一。我们用竖线（`|`）分隔每个类型。

```typescript
function printId(id: number | string) {
  console.log('Your ID is: ' + id)
}

printId(101) // 可以
printId('202') // 可以
// printId({ myID: 22342 }); // 错误
```

## 交叉类型

交叉类型将多个类型合并为一个类型。这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。(并集)

```typescript
interface ErrorHandling {
  success: boolean
  error?: { message: string }
}

interface ArtworksData {
  artworks: { title: string }[]
}

type ArtworksResponse = ArtworksData & ErrorHandling

const response: ArtworksResponse = {
  artworks: [{ title: 'Mona Lisa' }],
  success: true
}
```

## 类型别名

类型别名会给一个类型起个新名字。类型别名有时和接口很像，但是可以作用于原始值、联合类型、元组以及其它任何你需要手写的类型。

```typescript
type Point = {
  x: number
  y: number
}

type ID = number | string

type UserInputSanitizedString = string
```

## 字面量类型

字面量类型允许你指定一个值必须是一个特定的字符串或数字。

```typescript
type Easing = 'ease-in' | 'ease-out' | 'ease-in-out'

function animate(dx: number, dy: number, easing: Easing) {
  if (easing === 'ease-in') {
    // ...
  } else if (easing === 'ease-out') {
    // ...
  } else {
    // ...
  }
}

animate(0, 0, 'ease-in')
// animate(0, 0, "linear"); // 错误
```

## 可辨识联合

可辨识联合是一种高级的模式匹配方式，它结合了字面量类型、联合类型、类型守卫和类型别名。

```typescript
interface Square {
  kind: 'square'
  size: number
}

interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}

type Shape = Square | Rectangle

function area(s: Shape) {
  switch (s.kind) {
    case 'square':
      return s.size * s.size
    case 'rectangle':
      return s.width * s.height
  }
}
```

## 索引类型和映射类型

### 索引类型

索引类型允许我们使用动态的属性名来访问对象的属性，同时保持类型安全。

````typescript
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
    return names.map(n => o[n]);
}

interface Person {
    name: string;
    age: number;
}

let person: Person = {
    name: "Jarid",
    age: 35
};

let strings: string[] = pluck(person, ["name"]); // ok, string[]
````

主要涉及两个操作符：

1. `keyof T`：索引类型查询操作符，它会产生一个表示 T 类型的所有公共属性名的联合类型。
2. `T[K]`：索引访问操作符，它允许我们在类型层面访问 T 类型的属性 K 的类型。

在前面的例子中：

```typescript
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n])
}
```

- `T` 是一个泛型参数，代表任意对象类型。
- `K extends keyof T` 表示 K 是 T 的属性名的子类型。
- `names: K[]` 表示 names 是一个 K 类型的数组，即 T 的属性名的数组。
- `T[K][]` 表示返回类型是一个数组，其元素类型是 T 对象中 K 属性的类型。

### 映射类型

映射类型允许我们基于旧类型创建新类型，通过遍历旧类型的属性来转换它们。

````typescript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

type PersonPartial = Partial<Person>;
type ReadonlyPerson = Readonly<Person>;
````

在例子中：

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

- `T` 是输入的类型。
- `P in keyof T` 表示遍历 T 的所有属性。
- `readonly` 表示新类型中的所有属性都是只读的。
- `T[P]` 表示保持原属性的类型不变。

### 实际业务场景

1. 部分更新对象：

在 API 调用中，我们可能只需要更新对象的部分属性。

```typescript
interface User {
  id: number
  name: string
  email: string
}

type PartialUser = Partial<User>

function updateUser(userId: number, update: PartialUser) {
  // 实现部分更新逻辑
}

updateUser(1, { name: 'New Name' }) // 有效
updateUser(2, { email: 'new@email.com' }) // 有效
```

2. 属性验证：

当我们需要验证对象的特定属性时，可以使用索引类型。

```typescript
function validateProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  predicate: (value: T[K]) => boolean
) {
  return predicate(obj[key])
}

const user = { id: 1, name: 'John', age: 30 }
const isValidAge = validateProperty(user, 'age', age => age > 0 && age < 150)
```

3. 创建只读版本的类型：

在某些情况下，我们可能希望创建一个现有类型的只读版本，以防止意外修改。

```typescript
interface Config {
  apiUrl: string
  timeout: number
}

type ReadonlyConfig = Readonly<Config>

const config: ReadonlyConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
}

// config.apiUrl = "https://new-api.example.com"; // 错误：无法分配到 "apiUrl" ，因为它是只读属性。
```

4. 从 API 响应中提取特定字段：

当处理大型 API 响应时，我们可能只需要提取特定的字段。

```typescript
interface ApiResponse {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  // ... 可能还有更多字段
}

function extractFields<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => (result[key] = obj[key]))
  return result
}

const fullPost: ApiResponse = {
  id: 1,
  title: 'Hello',
  content: 'World',
  author: 'John',
  createdAt: '2023-05-20'
}

const extractedPost = extractFields(fullPost, ['id', 'title', 'author'])
// extractedPost 的类型为 { id: number; title: string; author: string; }
```