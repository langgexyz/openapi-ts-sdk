# 测试文档

## 测试文件说明

本项目的测试文件按照功能边界进行组织，每个文件都有明确的测试范围：

### 核心功能测试

#### `http-builder-core.test.js`
- **测试范围**: HTTP Builder 核心功能
- **内容**: 
  - HttpMethod 枚举测试
  - 链式调用测试
  - 属性设置/获取测试  
  - 头部管理测试
  - Pusher 功能测试
  - 默认值测试

### HTTP 实现测试

#### `axios-http-builder.test.js`
- **测试范围**: Axios HTTP Builder 实现
- **内容**:
  - 构建测试
  - POST 请求测试
  - GET 参数转换测试
  - 错误处理测试
  - 无效 JSON 处理测试

#### `fetch-http-builder.test.js`
- **测试范围**: Fetch HTTP Builder 实现
- **内容**:
  - 构建测试
  - 环境检查测试
  - GET 参数构建测试
  - POST 请求构建测试
  - HTTP 错误响应测试
  - 无效 JSON 处理测试

#### `gateway-http-builder.test.js`
- **测试范围**: Gateway HTTP Builder 实现
- **内容**:
  - 构建测试
  - 代理请求测试
  - Header Builder 集成测试
  - 错误处理测试
  - 不同 HTTP 方法测试

### 错误场景测试

#### `error-scenarios.test.js`
- **测试范围**: 各种错误和异常场景
- **内容**:
  - Axios 网络错误测试
  - Axios 超时错误测试
  - Fetch HTTP 错误状态测试
  - Gateway 连接错误测试
  - 无效 JSON 内容处理测试
  - 边界情况测试
  - 构造函数参数验证测试

### 环境兼容性测试

#### `environment-compatibility.test.js`
- **测试范围**: 不同环境下的兼容性
- **内容**:
  - 运行时环境检查
  - CommonJS 模块导入测试
  - 可选依赖检查
  - FetchHttpBuilder 环境兼容性
  - AxiosHttpBuilder 依赖检查
  - GatewayHttpBuilder 依赖检查
  - TypeScript 类型兼容性检查
  - package.json 兼容性检查

### 集成测试

#### `integration-real-services.test.js`
- **测试范围**: 对真实服务的集成测试
- **内容**:
  - 服务可用性检查
  - FetchHttpBuilder 真实服务测试
  - AxiosHttpBuilder 真实服务测试
  - GatewayHttpBuilder 真实服务测试
  - 性能对比测试

## 运行测试

### 单独运行测试

```bash
# 核心功能测试
npm run test:core

# Axios 实现测试
npm run test:axios

# Fetch 实现测试
npm run test:fetch

# Gateway 实现测试
npm run test:gateway

# 环境兼容性测试
npm run test:environment

# 错误场景测试
npm run test:errors

# 集成测试（需要启动服务）
npm run test:integration
```

### 运行所有测试

```bash
# 运行全部单元测试
npm run test:all

# 运行包括构建的完整测试
npm test
```

## 测试依赖

### 必需依赖
- 无额外依赖（所有测试使用内置 Node.js 功能）

### 可选依赖
- `axios` - 用于 AxiosHttpBuilder 测试
- `gateway-ts-sdk` - 用于 GatewayHttpBuilder 测试
- `ws` - 用于 WebSocket 连接测试

### 真实服务（集成测试）
- `midway-ts-server` (端口 7001) - 用于集成测试
- `gateway-go-server` (端口 18443) - 用于 Gateway 集成测试
- `httpbin.org` - 公共测试服务

## 测试架构

### 测试原则
1. **明确的边界**: 每个测试文件有清晰的测试范围
2. **独立性**: 测试之间相互独立，不依赖执行顺序
3. **Mock 优先**: 优先使用 Mock 对象，减少外部依赖
4. **错误处理**: 充分测试各种错误场景
5. **环境兼容**: 测试在不同环境下的兼容性

### Mock 策略
- **Axios**: 使用 MockAxiosInstance 模拟 axios 行为
- **Gateway**: 使用 MockGatewayClient 和 MockHeaderBuilder
- **Fetch**: 使用 global.fetch 替换进行模拟
- **服务**: 在集成测试中使用真实服务，其他测试使用 Mock

### 测试覆盖
- ✅ 核心功能完整覆盖
- ✅ 所有 HTTP 实现覆盖
- ✅ 错误场景覆盖
- ✅ 环境兼容性覆盖
- ✅ 集成测试覆盖

## 测试结果解读

### 成功标志
- `✅` - 测试通过
- `⚠️` - 警告（功能可用但有限制）

### 失败标志  
- `❌` - 测试失败
- 错误信息会显示具体失败原因

### 跳过标志
- 当依赖不可用时，相关测试会被跳过并显示说明
