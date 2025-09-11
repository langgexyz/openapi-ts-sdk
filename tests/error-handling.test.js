// 错误处理测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== 错误处理测试 ===');

// Mock 失败的 HTTP 请求器
class FailingHttpRequester {
  async request(config) {
    const error = new Error('Network request failed');
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { message: 'Server error' }
    };
    throw error;
  }
}

// Mock 失败的 Gateway 客户端
class FailingGatewayClient {
  async sendRaw(command, data, headers) {
    const error = new Error('Gateway connection failed');
    error.code = 'GATEWAY_ERROR';
    throw error;
  }
}

// Mock Header Builder
class MockHeaderBuilder {
  constructor() {
    this.headers = new Map();
  }
  
  setProxy(url, method) {
    this.headers.set('X-Proxy-URL', url);
    this.headers.set('X-Proxy-Method', method);
    return this;
  }
  
  build() {
    return this.headers;
  }
}

// 1. 测试 JSON 验证错误
console.log('\n1. JSON 验证错误测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // 测试各种无效的 JSON 格式
  const invalidJsonCases = [
    'invalid json',
    '{"incomplete": }',
    '{incomplete: "json"}',
    'undefined',
    'function() { return "not json"; }'
  ];
  
  let errorCount = 0;
  
  for (const invalidJson of invalidJsonCases) {
    try {
      builder.setContent(invalidJson);
      console.error(`❌ 应该抛出错误: ${invalidJson}`);
    } catch (error) {
      if (error.message.includes('Content must be valid JSON')) {
        errorCount++;
      } else {
        console.error(`❌ 错误类型不正确: ${error.message}`);
      }
    }
  }
  
  if (errorCount === invalidJsonCases.length) {
    console.log('✅ JSON 验证错误测试通过');
  } else {
    console.error(`❌ JSON 验证错误测试失败: ${errorCount}/${invalidJsonCases.length}`);
  }
} catch (error) {
  console.error('❌ JSON 验证错误测试失败:', error.message);
}

// 2. 测试 Axios 错误处理
console.log('\n2. Axios 错误处理测试:');
try {
  const failingRequester = new FailingHttpRequester();
  const builder = new AxiosHttpBuilder('https://api.example.com', failingRequester);
  
  const http = builder
    .setUri('/failing-endpoint')
    .setMethod(HttpMethod.POST)
    .setContent('{"test": "data"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      // 验证错误信息
      if (error.message.includes('Network request failed')) {
        console.log('✅ Axios 错误正确处理');
        
        // 验证附加的错误信息
        if (error.status === 500 && error.statusText === 'Internal Server Error') {
          console.log('✅ Axios 错误信息完整');
        } else {
          console.error('❌ Axios 错误信息不完整');
        }
      } else {
        console.error('❌ Axios 错误信息格式错误:', error.message);
      }
    } else {
      console.error('❌ Axios 应该返回错误');
    }
  }).catch(err => {
    console.error('❌ Axios 错误处理测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios 错误处理测试失败:', error.message);
}

// 3. 测试 Gateway 错误处理
console.log('\n3. Gateway 错误处理测试:');
try {
  const failingClient = new FailingGatewayClient();
  const mockHeaderBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', failingClient, mockHeaderBuilder);
  
  const http = builder
    .setUri('/failing-proxy')
    .setMethod(HttpMethod.GET)
    .setContent('{"proxy": "test"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      // 验证错误信息
      if (error.message.includes('Gateway connection failed')) {
        console.log('✅ Gateway 错误正确处理');
        
        // 验证附加的错误信息
        if (error.code === 'GATEWAY_ERROR') {
          console.log('✅ Gateway 错误代码正确');
        } else {
          console.error('❌ Gateway 错误代码不正确');
        }
      } else {
        console.error('❌ Gateway 错误信息格式错误:', error.message);
      }
    } else {
      console.error('❌ Gateway 应该返回错误');
    }
  }).catch(err => {
    console.error('❌ Gateway 错误处理测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway 错误处理测试失败:', error.message);
}

// 4. 测试边界情况
console.log('\n4. 边界情况测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // 测试空字符串 content
  builder.setContent('');
  console.log('✅ 空字符串 content 处理正确');
  
  // 测试最小有效 JSON
  builder.setContent('{}');
  console.log('✅ 最小有效 JSON 处理正确');
  
  // 测试复杂 JSON
  const complexJson = JSON.stringify({
    nested: {
      array: [1, 2, 3],
      object: { key: 'value' },
      null_value: null,
      boolean: true,
      number: 42.5
    }
  });
  builder.setContent(complexJson);
  console.log('✅ 复杂 JSON 处理正确');
  
  // 测试特殊字符
  const specialJson = JSON.stringify({
    unicode: '中文测试',
    special: 'line\nbreak\ttab',
    quote: 'He said "Hello"'
  });
  builder.setContent(specialJson);
  console.log('✅ 特殊字符 JSON 处理正确');
  
  console.log('✅ 边界情况测试通过');
} catch (error) {
  console.error('❌ 边界情况测试失败:', error.message);
}

// 5. 测试构建时错误
console.log('\n5. 构建时错误测试:');
try {
  // 测试无效的环境检查
  if (typeof fetch === 'undefined') {
    try {
      const builder = new FetchHttpBuilder('https://api.example.com');
      console.log('⚠️  Fetch 在 Node.js 环境中可能不可用，但构建成功');
    } catch (fetchError) {
      console.log('✅ Fetch 环境检查正确:', fetchError.message);
    }
  } else {
    console.log('✅ Fetch API 可用');
  }
  
  console.log('✅ 构建时错误测试完成');
} catch (error) {
  console.error('❌ 构建时错误测试失败:', error.message);
}

console.log('\n=== 错误处理测试完成 ===');
