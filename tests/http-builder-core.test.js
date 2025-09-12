// HTTP Builder 核心功能测试
const { HttpMethod, HttpBuilder } = require('../dist/index');

// 创建测试用的 HttpBuilder 实现
class TestHttpBuilder extends HttpBuilder {
  build() {
    return {
      send: async () => ['test response', null]
    };
  }
}

console.log('=== HTTP Builder 核心功能测试 ===');

// 1. 测试 HttpMethod 枚举
console.log('\n1. HttpMethod 枚举测试:');
try {
  const methods = Object.values(HttpMethod);
  const expectedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  
  console.log('可用的 HTTP 方法:', methods);
  
  let missingMethods = [];
  for (const method of expectedMethods) {
    if (!methods.includes(method)) {
      missingMethods.push(method);
    }
  }
  
  if (missingMethods.length === 0) {
    console.log('✅ HttpMethod 枚举包含所有标准方法');
  } else {
    console.error(`❌ 缺少 HTTP 方法: ${missingMethods.join(', ')}`);
  }
  
  // 测试枚举值是否正确
  if (HttpMethod.GET === 'GET' && 
      HttpMethod.POST === 'POST' && 
      HttpMethod.PUT === 'PUT' && 
      HttpMethod.DELETE === 'DELETE') {
    console.log('✅ HttpMethod 枚举值正确');
  } else {
    console.error('❌ HttpMethod 枚举值错误');
  }
  
} catch (error) {
  console.error('❌ HttpMethod 枚举测试失败:', error.message);
}

// 2. 测试基础构建器功能（通过自定义测试实现）
console.log('\n2. HttpBuilder 基础功能测试:');
try {
  const builder = new TestHttpBuilder('https://api.example.com');
  
  // 测试链式调用
  const chainedBuilder = builder
    .setUri('/api/test')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .addHeader('Authorization', 'Bearer test-token')
    .setContent('{"message": "test"}');
    
  if (chainedBuilder === builder) {
    console.log('✅ HttpBuilder 链式调用正确');
  } else {
    console.error('❌ HttpBuilder 链式调用失败');
  }
  
  // 测试属性获取
  if (builder.baseUrl() === 'https://api.example.com') {
    console.log('✅ HttpBuilder baseUrl() 方法正确');
  } else {
    console.error('❌ HttpBuilder baseUrl() 方法错误');
  }
  
  if (builder.uri() === '/api/test') {
    console.log('✅ HttpBuilder uri() 方法正确');
  } else {
    console.error('❌ HttpBuilder uri() 方法错误');
  }
  
  if (builder.method() === HttpMethod.POST) {
    console.log('✅ HttpBuilder method() 方法正确');
  } else {
    console.error('❌ HttpBuilder method() 方法错误');
  }
  
  if (builder.content() === '{"message": "test"}') {
    console.log('✅ HttpBuilder content() 方法正确');
  } else {
    console.error('❌ HttpBuilder content() 方法错误');
  }
  
} catch (error) {
  console.error('❌ HttpBuilder 基础功能测试失败:', error.message);
}

// 3. 测试头部管理
console.log('\n3. HttpBuilder 头部管理测试:');
try {
  const builder = new TestHttpBuilder('https://api.example.com');
  
  // 添加多个头部
  builder
    .addHeader('Content-Type', 'application/json')
    .addHeader('Authorization', 'Bearer token123')
    .addHeader('X-Custom-Header', 'custom-value')
    .addHeader('Accept', 'application/json');
  
  const headers = builder.headers();
  
  if (headers instanceof Map) {
    console.log('✅ HttpBuilder headers() 返回 Map 类型');
  } else {
    console.error('❌ HttpBuilder headers() 应该返回 Map 类型');
  }
  
  if (headers.size === 4) {
    console.log('✅ HttpBuilder 头部数量正确');
  } else {
    console.error(`❌ HttpBuilder 头部数量错误: 期望 4，实际 ${headers.size}`);
  }
  
  if (headers.get('Content-Type') === 'application/json' &&
      headers.get('Authorization') === 'Bearer token123' &&
      headers.get('X-Custom-Header') === 'custom-value') {
    console.log('✅ HttpBuilder 头部值正确');
  } else {
    console.error('❌ HttpBuilder 头部值错误');
  }
  
  // 测试头部覆盖
  builder.addHeader('Content-Type', 'application/xml');
  if (headers.get('Content-Type') === 'application/xml') {
    console.log('✅ HttpBuilder 头部覆盖正确');
  } else {
    console.error('❌ HttpBuilder 头部覆盖失败');
  }
  
} catch (error) {
  console.error('❌ HttpBuilder 头部管理测试失败:', error.message);
}

// 4. 测试 Pusher 功能
console.log('\n4. HttpBuilder Pusher 功能测试:');
try {
  const builder = new TestHttpBuilder('https://api.example.com');
  
  let pushedData = null;
  const testPusher = (data) => {
    pushedData = data;
  };
  
  builder.setPusher(testPusher);
  
  if (typeof builder.pusher() === 'function') {
    console.log('✅ HttpBuilder pusher() 返回函数');
  } else {
    console.error('❌ HttpBuilder pusher() 应该返回函数');
  }
  
  // 测试 pusher 调用
  builder.pusher()('test data');
  
  if (pushedData === 'test data') {
    console.log('✅ HttpBuilder Pusher 功能正确');
  } else {
    console.error('❌ HttpBuilder Pusher 功能错误');
  }
  
} catch (error) {
  console.error('❌ HttpBuilder Pusher 功能测试失败:', error.message);
}

// 5. 测试默认值
console.log('\n5. HttpBuilder 默认值测试:');
try {
  const builder = new TestHttpBuilder('https://api.example.com');
  
  // 检查默认值
  if (builder.uri() === '') {
    console.log('✅ HttpBuilder 默认 URI 为空字符串');
  } else {
    console.error('❌ HttpBuilder 默认 URI 应该为空字符串');
  }
  
  if (builder.method() === HttpMethod.POST) {
    console.log('✅ HttpBuilder 默认方法为 POST');
  } else {
    console.error('❌ HttpBuilder 默认方法应该为 POST');
  }
  
  if (builder.content() === '') {
    console.log('✅ HttpBuilder 默认 content 为空字符串');
  } else {
    console.error('❌ HttpBuilder 默认 content 应该为空字符串');
  }
  
  if (builder.headers().size === 0) {
    console.log('✅ HttpBuilder 默认头部为空');
  } else {
    console.error('❌ HttpBuilder 默认头部应该为空');
  }
  
} catch (error) {
  console.error('❌ HttpBuilder 默认值测试失败:', error.message);
}

// 6. 测试 setHeaders 批量设置
console.log('\n6. HttpBuilder 批量设置头部测试:');
try {
  const builder = new TestHttpBuilder('https://api.example.com');
  
  const headersMap = new Map([
    ['Content-Type', 'application/json'],
    ['Authorization', 'Bearer batch-token'],
    ['Accept', 'application/json'],
    ['User-Agent', 'test-client/1.0.0']
  ]);
  
  builder.setHeaders(headersMap);
  
  const resultHeaders = builder.headers();
  
  if (resultHeaders.size === 4) {
    console.log('✅ HttpBuilder 批量设置头部数量正确');
  } else {
    console.error(`❌ HttpBuilder 批量设置头部数量错误: 期望 4，实际 ${resultHeaders.size}`);
  }
  
  let allHeadersCorrect = true;
  for (const [key, value] of headersMap) {
    if (resultHeaders.get(key) !== value) {
      allHeadersCorrect = false;
      break;
    }
  }
  
  if (allHeadersCorrect) {
    console.log('✅ HttpBuilder 批量设置头部值正确');
  } else {
    console.error('❌ HttpBuilder 批量设置头部值错误');
  }
  
} catch (error) {
  console.error('❌ HttpBuilder 批量设置头部测试失败:', error.message);
}

console.log('\n=== HTTP Builder 核心功能测试完成 ===');
