# 测试文档

## 🎯 测试架构

本项目采用 **纯模块化测试架构**，每个测试文件对应一个具体的实现模块，包含该模块的全方位测试。

### 📁 测试文件组织

每个测试文件都包含 **4 大测试维度**，确保全面覆盖：

#### 🔧 `http-builder-core.test.js`
**测试范围**: HTTP Builder 核心功能  
**完整测试内容**:
- ✅ HttpMethod 枚举测试
- ✅ 链式调用测试  
- ✅ 属性设置/获取测试
- ✅ 头部管理测试
- ✅ Pusher 功能测试
- ✅ 默认值测试

#### 🌐 `axios-http-builder.test.js`
**测试范围**: Axios HTTP Builder 完整实现  
**完整测试内容**:
- ✅ **基础功能**: 构建、POST/GET 请求、参数转换
- ✅ **真实服务**: httpbin.org 集成测试
- ✅ **错误场景**: 网络错误、超时错误处理
- ✅ **环境兼容**: 依赖检查、参数验证

#### 🚀 `fetch-http-builder.test.js`
**测试范围**: Fetch HTTP Builder 完整实现  
**完整测试内容**:
- ✅ **基础功能**: 构建、环境检查、GET/POST 请求
- ✅ **真实服务**: httpbin.org 集成测试
- ✅ **错误场景**: HTTP 错误状态处理
- ✅ **环境兼容**: Fetch API 可用性检测

#### 🌉 `gateway-http-builder.test.js`
**测试范围**: Gateway HTTP Builder 完整实现  
**完整测试内容**:
- ✅ **基础功能**: 构建、代理请求、Header Builder 集成
- ✅ **真实服务**: 本地 Gateway/Midway 服务集成测试
- ✅ **错误场景**: Gateway 连接错误处理
- ✅ **环境兼容**: gateway-ts-sdk 依赖检查

## 🚀 运行测试

### 按模块运行测试

```bash
# 核心功能测试
npm run test:core

# Axios 实现完整测试（包含基础+真实服务+错误+兼容性）
npm run test:axios

# Fetch 实现完整测试（包含基础+真实服务+错误+兼容性）
npm run test:fetch

# Gateway 实现完整测试（包含基础+真实服务+错误+兼容性）
npm run test:gateway
```

### 运行所有测试

```bash
# 运行全部模块测试
npm run test:all

# 运行包括构建的完整测试
npm test
```

## 🔧 测试依赖与架构

### 必需依赖
- 无额外依赖（所有测试使用内置 Node.js 功能）

### 可选依赖
- `axios` - Axios 实现测试
- `gateway-ts-sdk` - Gateway 实现测试（位于 `../gateway-ts-sdk`）

### 真实服务（集成测试）
- `httpbin.org` - 公共 HTTP 测试服务
- `midway-ts-server` (端口 7001) - 本地 Midway 服务
- `gateway-go-server` (端口 18443) - 本地 Gateway 服务

## 🏗️ 测试架构原则

### 核心设计理念
1. **🎯 纯模块化**: 按实现模块组织，一个模块 = 一个测试文件
2. **📦 全维度覆盖**: 每个模块测试包含 4 个维度（基础+真实+错误+兼容）
3. **🔒 清晰边界**: 测试文件名即可明确测试范围
4. **🔄 独立运行**: 每个测试文件可独立执行
5. **🛡️ Mock 优先**: 减少外部依赖，提高测试稳定性

### Mock 策略
- **Axios**: 使用 `MockAxiosInstance` 模拟请求行为
- **Gateway**: 使用 `MockGatewayClient` 和 `MockHeaderBuilder`
- **Fetch**: 使用 `global.fetch` 替换进行模拟
- **错误场景**: 专用失败类模拟各种异常情况

### 架构优势
- ✅ **边界清晰**: 文件名就是测试范围
- ✅ **功能完整**: 每个模块 4 维度全覆盖
- ✅ **易于维护**: 单一职责，内聚性高
- ✅ **快速定位**: 问题直接对应到具体模块

## 📊 测试结果解读

### 测试状态标识
- `✅` - 测试通过
- `⚠️` - 警告（功能可用但有限制）  
- `❌` - 测试失败
- 错误信息会显示具体失败原因

### 依赖处理策略
- 当可选依赖不可用时，相关测试会被跳过并显示说明
- 真实服务不可用时，会降级到 Mock 测试
- 环境不支持的功能会给出明确提示

## 🎯 测试重构成果

### 重构前的问题
- ❌ 测试文件既按模块分又按功能分（混乱）
- ❌ `error-scenarios.test.js` 混合多个模块的错误测试
- ❌ `environment-compatibility.test.js` 混合多个模块的兼容性测试
- ❌ `integration-real-services.test.js` 混合多个模块的集成测试

### 重构后的优势  
- ✅ **100% 按模块分**: 一个实现 = 一个测试文件
- ✅ **边界清晰**: 文件名立即看出测试内容
- ✅ **功能完整**: 每个模块测试包含全方位覆盖
- ✅ **架构一致**: 无混合边界，纯模块化设计

现在真正实现了**清晰的测试边界**！🚀
