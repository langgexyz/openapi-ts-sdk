# TypeScript SDK Client

一个支持多种 HTTP 实现的 TypeScript SDK 客户端库，提供统一的 HTTP 构建器接口，支持 Axios、Fetch 和 Gateway 三种实现方式。

## ✨ 特性

- 🔧 **多种 HTTP 实现**: 支持 Axios、原生 Fetch 和 Gateway
- 📦 **TypeScript 原生支持**: 完整的类型定义和 IntelliSense 支持
- 🔄 **统一接口**: 一致的 API 设计，轻松切换不同 HTTP 实现
- 🛡️ **健壮的错误处理**: 规范化的错误响应格式和早期验证
- 🔌 **可扩展架构**: 基于抽象类的设计，方便扩展新的 HTTP 实现
- 📱 **跨环境兼容**: 同时支持 Node.js 和浏览器环境
- ⚡ **零依赖核心**: 核心功能无外部依赖，轻量级设计
- 🎯 **JSON 优先**: 强制 JSON 格式验证，确保 API 调用的一致性

## 🚀 快速开始

### 安装

```bash
npm install ts-sdk-client
```

### 基本使用

```typescript
import { AxiosHttpBuilder, FetchHttpBuilder, HttpMethod } from 'ts-sdk-client';
import axios from 'axios';

// 使用 Axios 实现
const axiosApi = new AxiosHttpBuilder('https://api.example.com', axios);
const axiosHttp = axiosApi
  .setUri('/users/profile')
  .setMethod(HttpMethod.GET)
  .addHeader('Authorization', 'Bearer your-token')
  .build();

const [response, error] = await axiosHttp.send();

// 使用 Fetch 实现
const fetchApi = new FetchHttpBuilder('https://api.example.com');
const fetchHttp = fetchApi
  .setUri('/users/profile')  
  .setMethod(HttpMethod.GET)
  .addHeader('Authorization', 'Bearer your-token')
  .build();

const [response2, error2] = await fetchHttp.send();
```

## 📚 详细使用指南

### Axios HTTP Builder

```typescript
import { AxiosHttpBuilder, HttpMethod } from 'ts-sdk-client';
import axios from 'axios';

// 创建自定义 axios 实例
const customAxios = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'MyApp/1.0.0'
  }
});

// 添加拦截器
customAxios.interceptors.request.use(config => {
  config.headers['X-Request-Time'] = new Date().toISOString();
  return config;
});

// 使用自定义实例
const builder = new AxiosHttpBuilder('https://api.example.com', customAxios);

const http = builder
  .setUri('/api/data')
  .setMethod(HttpMethod.POST)
  .addHeader('Content-Type', 'application/json')
  .setContent(JSON.stringify({ key: 'value' }))
  .build();

const [response, error] = await http.send();
```

### Fetch HTTP Builder

```typescript
import { FetchHttpBuilder, HttpMethod } from 'ts-sdk-client';

const builder = new FetchHttpBuilder('https://api.example.com');

const http = builder
  .setUri('/api/data')
  .setMethod(HttpMethod.POST)
  .addHeader('Content-Type', 'application/json')
  .setContent(JSON.stringify({ key: 'value' }))
  .build();

const [response, error] = await http.send();
```

### Gateway HTTP Builder

```typescript
import { GatewayHttpBuilder, HttpMethod } from 'ts-sdk-client';

// 需要提供 Gateway 客户端和头部构建器实例
const gatewayClient = new YourGatewayClient();
const headerBuilder = new YourHeaderBuilder();

const builder = new GatewayHttpBuilder(
  'https://api.example.com', 
  gatewayClient, 
  headerBuilder
);

const http = builder
  .setUri('/api/data')
  .setMethod(HttpMethod.POST)
  .addHeader('Content-Type', 'application/json')
  .setContent(JSON.stringify({ key: 'value' }))
  .build();

const [response, error] = await http.send();
```

### API 类封装示例

```typescript
import { AxiosHttpBuilder, HttpMethod } from 'ts-sdk-client';

class TwitterApi {
  constructor(private httpBuilder: AxiosHttpBuilder) {}

  async searchTimeline(request: { caAddress: string }) {
    const http = this.httpBuilder
      .setUri('/api/bigVCall/searchTimeline')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify(request))
      .build();

    const [response, error] = await http.send();
    
    if (error) {
      throw error;
    }
    
    return JSON.parse(response);
  }

  // 静态工厂方法
  static createWithAxios(baseUrl: string, httpRequester: any) {
    const builder = new AxiosHttpBuilder(baseUrl, httpRequester);
    return new TwitterApi(builder);
  }
}

// 使用
const api = TwitterApi.createWithAxios('https://api.twitter.com', axios);
const timeline = await api.searchTimeline({ caAddress: '0x123...' });
```

## 🏗️ 项目架构

### 设计原则

- **轻量级设计**: 核心功能无外部运行时依赖
- **接口分离**: 每个 HTTP 实现包含自己的接口定义
- **依赖注入**: 用户提供具体的 HTTP 客户端实例
- **早期验证**: 在构建时验证 JSON 格式，避免运行时错误
- **类型安全**: 使用 `unknown` 而非 `any`，强制类型检查

### 核心接口

- `HttpBuilder`: 抽象构建器基类，定义统一的构建接口
- `Http`: HTTP 请求执行接口
- `HttpMethod`: HTTP 方法枚举

### 实现层

- `AxiosHttpBuilder`: 基于 Axios 的实现（包含 Axios 接口定义）
- `FetchHttpBuilder`: 基于原生 Fetch 的实现  
- `GatewayHttpBuilder`: 基于 Gateway SDK 的实现（包含 Gateway 接口定义）

### 目录结构

```
ts-sdk-client/
├── src/                          # TypeScript 源代码
│   ├── core/                     # 核心接口和抽象类
│   │   ├── http-builder.abstract.ts  # HTTP 构建器抽象类（包含接口）
│   │   └── index.ts              # 核心模块导出
│   ├── axios/                    # Axios HTTP 实现
│   │   ├── axios-http-builder.ts # Axios 实现（包含接口定义）
│   │   └── index.ts              # Axios 模块导出
│   ├── gateway/                  # Gateway HTTP 实现
│   │   ├── gateway-http-builder.ts # Gateway 实现（包含接口定义）
│   │   └── index.ts              # Gateway 模块导出
│   ├── fetch/                    # Fetch HTTP 实现
│   │   ├── fetch-http-builder.ts # Fetch 实现
│   │   └── index.ts              # Fetch 模块导出
│   ├── types/                    # 类型定义目录
│   └── index.ts                  # 主入口文件
├── dist/                         # 编译生成的 JavaScript 文件
├── examples/                     # 使用示例
│   └── commonjs-usage.js        # CommonJS 环境示例
├── tests/                        # 测试文件
│   └── test-commonjs.js         # CommonJS 兼容性测试
├── package.json                  # 项目配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目文档
```

## 🔧 开发指南

### 环境要求

- Node.js >= 14.0.0
- TypeScript >= 5.0.0

### 开发命令

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 监听模式编译
npm run watch

# 运行测试
npm test

# 运行示例
npm run example

# 清理编译产物
npm run clean
```

### 构建流程

1. **开发阶段**: 编辑 `src/` 目录下的 TypeScript 文件
2. **编译**: 运行 `npm run build` 编译到 `dist/` 目录
3. **测试**: 运行 `npm test` 执行测试套件
4. **发布**: 运行 `npm run prepublishOnly` 执行完整的发布前检查

### JSON 内容验证

所有的 `setContent()` 调用都会进行 JSON 格式验证：

```typescript
import { FetchHttpBuilder, HttpMethod } from 'ts-sdk-client';

const builder = new FetchHttpBuilder('https://api.example.com');

try {
  // 正确的 JSON 格式
  builder.setContent(JSON.stringify({ key: 'value' }));
  
  // 错误的格式会抛出异常
  builder.setContent('invalid json'); // 抛出错误
} catch (error) {
  console.error('Content must be valid JSON:', error.message);
}
```

## 📋 API 参考

### HttpBuilder 抽象类

**核心方法:**

- `setUri(uri: string)`: 设置请求 URI
- `setMethod(method: HttpMethod)`: 设置 HTTP 方法
- `addHeader(key: string, value: string)`: 添加请求头
- `setContent(content: string)`: 设置请求体内容（必须是有效的 JSON 格式）
- `build()`: 构建 HTTP 请求实例

**HTTP 方法枚举:**

```typescript
enum HttpMethod {
  GET = 'GET',
  POST = 'POST', 
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}
```

### 响应格式

所有 HTTP 实现都返回统一的响应格式：

```typescript
const [response, error] = await http.send();

// 成功时: response 为字符串, error 为 null
// 失败时: response 为空字符串, error 为 Error 对象
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写所有源代码
- 遵循现有的代码风格和命名约定
- 为新功能添加相应的测试
- 更新相关文档

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 🔗 相关项目

- `gateway-ts-sdk`: Gateway SDK 依赖库
- `ts-sdk-client-generator`: 代码生成器工具

## 📞 支持与反馈

- 提交 [Issues](../../issues) 报告 Bug 或提出建议
- 查看 [Examples](examples/) 获取更多使用示例
- 参考 [Tests](tests/) 了解功能测试用例

---

**Dexx Team** - 让 API 客户端开发更简单 🚀
