// 核心功能单元测试
const { HttpMethod } = require('../dist/index');
const { FetchHttpBuilder } = require('../dist/index');

console.log('=== 核心功能单元测试 ===');

// 1. 测试 HttpMethod 枚举
console.log('\n1. HttpMethod 枚举测试:');
try {
  const methods = Object.values(HttpMethod);
  const expectedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  
  console.log('可用的 HTTP 方法:', methods);
  
  for (const method of expectedMethods) {
    if (!methods.includes(method)) {
      throw new Error(`缺少 HTTP 方法: ${method}`);
    }
  }
  
  console.log('✅ HttpMethod 枚举测试通过');
} catch (error) {
  console.error('❌ HttpMethod 枚举测试失败:', error.message);
}

// 2. 测试 HttpBuilder 基本功能
console.log('\n2. HttpBuilder 基本功能测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // 测试方法链调用
  const result = builder
    .setUri('/test')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .addHeader('Authorization', 'Bearer token');
    
  // 验证链式调用返回正确的实例
  if (result !== builder) {
    throw new Error('链式调用应该返回同一个实例');
  }
  
  // 验证基础属性
  if (builder.baseUrl() !== 'https://api.example.com') {
    throw new Error('baseUrl 设置错误');
  }
  
  if (builder.uri() !== '/test') {
    throw new Error('uri 设置错误');
  }
  
  if (builder.method() !== HttpMethod.POST) {
    throw new Error('method 设置错误');
  }
  
  console.log('✅ HttpBuilder 基本功能测试通过');
} catch (error) {
  console.error('❌ HttpBuilder 基本功能测试失败:', error.message);
}

// 3. 测试 setContent JSON 验证
console.log('\n3. setContent JSON 验证测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // 测试有效的 JSON
  builder.setContent('{"valid": "json"}');
  console.log('✅ 有效 JSON 验证通过');
  
  // 测试空字符串
  builder.setContent('');
  console.log('✅ 空字符串验证通过');
  
  // 测试无效的 JSON
  try {
    builder.setContent('invalid json');
    console.error('❌ 应该抛出 JSON 验证错误');
  } catch (jsonError) {
    if (jsonError.message.includes('Content must be valid JSON')) {
      console.log('✅ 无效 JSON 正确抛出错误');
    } else {
      throw jsonError;
    }
  }
  
  console.log('✅ setContent JSON 验证测试通过');
} catch (error) {
  console.error('❌ setContent JSON 验证测试失败:', error.message);
}

// 4. 测试 Headers 管理
console.log('\n4. Headers 管理测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // 添加多个头部
  builder
    .addHeader('Content-Type', 'application/json')
    .addHeader('Authorization', 'Bearer token')
    .addHeader('X-Custom-Header', 'custom-value');
    
  const headers = builder.headers();
  
  // 验证头部设置
  if (headers.get('Content-Type') !== 'application/json') {
    throw new Error('Content-Type 头部设置错误');
  }
  
  if (headers.get('Authorization') !== 'Bearer token') {
    throw new Error('Authorization 头部设置错误');
  }
  
  if (headers.get('X-Custom-Header') !== 'custom-value') {
    throw new Error('X-Custom-Header 头部设置错误');
  }
  
  // 测试头部覆盖
  builder.addHeader('Content-Type', 'text/plain');
  if (headers.get('Content-Type') !== 'text/plain') {
    throw new Error('头部覆盖失败');
  }
  
  console.log('✅ Headers 管理测试通过');
} catch (error) {
  console.error('❌ Headers 管理测试失败:', error.message);
}

console.log('\n=== 核心功能单元测试完成 ===');
