# TypeScript SDK Client

一个支持多种 HTTP 实现的 TypeScript SDK 客户端库，提供统一的 HTTP 构建器接口，支持 Axios、Fetch 和 Gateway 三种实现方式。

## ✨ 特性

- 🔧 **多种 HTTP 实现**: 支持 Axios、原生 Fetch 和 Gateway
- 📦 **TypeScript 原生支持**: 完整的类型定义和 IntelliSense 支持
- 🔄 **统一接口**: 一致的 API 设计，轻松切换不同 HTTP 实现
- 🛡️ **健壮的错误处理**: 规范化的错误响应格式
- 🔌 **可扩展架构**: 基于抽象类的设计，方便扩展新的 HTTP 实现
- 📱 **跨环境兼容**: 同时支持 Node.js 和浏览器环境
- ⚡ **零依赖核心**: 核心功能无外部依赖，可选的 peer dependencies

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

// 需要提供 Gateway 客户端和头部构建器
const gatewayClient = new YourGatewayClient();
const headerBuilderClass = YourHeaderBuilder;

const builder = new GatewayHttpBuilder(
  'https://api.example.com', 
  gatewayClient, 
  headerBuilderClass
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

### 核心接口

- `HttpBuilder`: 抽象构建器基类，定义统一的构建接口
- `Http`: HTTP 请求执行接口
- `HttpMethod`: HTTP 方法枚举

### 实现层

- `AxiosHttpBuilder`: 基于 Axios 的实现
- `FetchHttpBuilder`: 基于原生 Fetch 的实现  
- `GatewayHttpBuilder`: 基于 Gateway SDK 的实现

### 目录结构

```
ts-sdk-client/
├── src/                          # TypeScript 源代码
│   ├── core/                     # 核心接口和抽象类
│   │   ├── axios.interface.ts    # Axios 接口定义
│   │   ├── gateway.interface.ts  # Gateway 接口定义
│   │   ├── http.interface.ts     # HTTP 核心接口
│   │   ├── http-builder.abstract.ts  # 抽象构建器
│   │   ├── commonjs-utils.ts     # CommonJS 工具函数
│   │   └── index.ts              # 核心模块导出
│   ├── implementations/          # HTTP 实现
│   │   ├── axios-http-builder.ts # Axios 实现
│   │   ├── fetch-http-builder.ts # Fetch 实现
│   │   ├── gateway-http-builder.ts # Gateway 实现
│   │   └── index.ts              # 实现模块导出
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

### 兼容性检查

```typescript
import { checkCompatibility } from 'ts-sdk-client';

const compatibility = checkCompatibility();
console.log('Node.js:', compatibility.nodejs);
console.log('Fetch API:', compatibility.fetch);
```

## 📋 API 参考

### HttpBuilder 抽象类

**核心方法:**

- `setUri(uri: string)`: 设置请求 URI
- `setMethod(method: HttpMethod)`: 设置 HTTP 方法
- `addHeader(key: string, value: string)`: 添加请求头
- `setContent(content: string)`: 设置请求体内容
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
