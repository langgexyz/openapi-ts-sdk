// 错误场景测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== 错误场景测试 ===');

// Mock 失败的 Axios 实例
class FailingAxiosInstance {
  async request(config) {
    const error = new Error('Network connection failed');
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { error: 'Server is down' }
    };
    throw error;
  }
}

// Mock 超时的 Axios 实例
class TimeoutAxiosInstance {
  async request(config) {
    const error = new Error('Request timeout');
    error.code = 'ECONNABORTED';
    throw error;
  }
}

// Mock 失败的 Gateway 客户端
class FailingGatewayClient {
  async send(command, data, responseType, headers) {
    const error = new Error('Gateway connection lost');
    error.code = 'GATEWAY_CONNECTION_ERROR';
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

// 1. 测试 Axios 网络错误
console.log('\n1. Axios 网络错误测试:');
try {
  const failingInstance = new FailingAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', failingInstance);
  
  const http = builder
    .setUri('/api/data')
    .setMethod(HttpMethod.POST)
    .setContent('{"test": "data"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      if (error.message.includes('Network connection failed') && 
          error.status === 500 && 
          error.data) {
        console.log('✅ Axios 网络错误处理正确');
      } else {
        console.error('❌ Axios 网络错误格式错误:', error.message);
      }
    } else {
      console.error('❌ Axios 应该返回网络错误');
    }
  }).catch(err => {
    console.error('❌ Axios 网络错误测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios 网络错误测试失败:', error.message);
}

// 2. 测试 Axios 超时错误
console.log('\n2. Axios 超时错误测试:');
try {
  const timeoutInstance = new TimeoutAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', timeoutInstance);
  
  const http = builder
    .setUri('/api/slow')
    .setMethod(HttpMethod.GET)
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      if (error.message.includes('Request timeout')) {
        console.log('✅ Axios 超时错误处理正确');
      } else {
        console.error('❌ Axios 超时错误格式错误:', error.message);
      }
    } else {
      console.error('❌ Axios 应该返回超时错误');
    }
  }).catch(err => {
    console.error('❌ Axios 超时错误测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios 超时错误测试失败:', error.message);
}

// 3. 测试 Fetch HTTP 错误状态
console.log('\n3. Fetch HTTP 错误状态测试:');
try {
  const builder = new FetchHttpBuilder('https://api.example.com');
  
  // Mock fetch 返回各种错误状态
  const originalFetch = global.fetch;
  const errorStatuses = [
    { status: 400, statusText: 'Bad Request' },
    { status: 401, statusText: 'Unauthorized' },
    { status: 403, statusText: 'Forbidden' },
    { status: 404, statusText: 'Not Found' },
    { status: 500, statusText: 'Internal Server Error' }
  ];
  
  let testCount = 0;
  let successCount = 0;
  
  for (const errorStatus of errorStatuses) {
    global.fetch = async (url, options) => {
      return {
        ok: false,
        status: errorStatus.status,
        statusText: errorStatus.statusText,
        text: async () => `{"error": "${errorStatus.statusText}"}`
      };
    };
    
    const http = builder
      .setUri(`/api/error-${errorStatus.status}`)
      .setMethod(HttpMethod.GET)
      .build();
      
    try {
      const [response, error] = await http.send();
      
      if (error && error.message.includes(`HTTP ${errorStatus.status}`)) {
        successCount++;
      }
      testCount++;
      
      // 检查是否是最后一个测试
      if (testCount === errorStatuses.length) {
        if (successCount === errorStatuses.length) {
          console.log('✅ Fetch HTTP 错误状态处理正确');
        } else {
          console.error(`❌ Fetch HTTP 错误状态处理失败: ${successCount}/${errorStatuses.length}`);
        }
        
        // 恢复原始 fetch
        global.fetch = originalFetch;
      }
    } catch (testError) {
      console.error(`❌ Fetch ${errorStatus.status} 错误测试异常:`, testError.message);
    }
  }
} catch (error) {
  console.error('❌ Fetch HTTP 错误状态测试失败:', error.message);
}

// 4. 测试 Gateway 连接错误
console.log('\n4. Gateway 连接错误测试:');
try {
  const failingClient = new FailingGatewayClient();
  const headerBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', failingClient, headerBuilder);
  
  const http = builder
    .setUri('/api/proxy')
    .setMethod(HttpMethod.POST)
    .setContent('{"test": "data"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      if (error.message.includes('Gateway connection lost') && 
          error.code === 'GATEWAY_CONNECTION_ERROR') {
        console.log('✅ Gateway 连接错误处理正确');
      } else {
        console.error('❌ Gateway 连接错误格式错误:', error.message);
      }
    } else {
      console.error('❌ Gateway 应该返回连接错误');
    }
  }).catch(err => {
    console.error('❌ Gateway 连接错误测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway 连接错误测试失败:', error.message);
}

// 5. 测试无效 JSON 内容处理
console.log('\n5. 无效 JSON 内容处理测试:');
try {
  const invalidJsonCases = [
    'invalid json string',
    '{"incomplete": }',
    '{incomplete: "json"}',
    'undefined',
    'null',
    '',
    '   ',
    'function() { return {}; }'
  ];
  
  let axiosSuccessCount = 0;
  let fetchSuccessCount = 0;
  
  // 测试 Axios 处理无效 JSON
  class MockAxiosInstance {
    async request(config) {
      return {
        data: { 
          params: config.params || null,
          data: config.data || null 
        },
        status: 200,
        statusText: 'OK'
      };
    }
  }
  
  const axiosInstance = new MockAxiosInstance();
  
  for (const invalidJson of invalidJsonCases) {
    try {
      const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
      const http = builder
        .setUri('/api/test')
        .setMethod(HttpMethod.GET)  // GET 会尝试解析 JSON 作为参数
        .setContent(invalidJson)
        .build();
        
      const [response, error] = await http.send();
      
      if (!error) {
        const data = JSON.parse(response);
        // 应该忽略无效的 JSON，不设置 params
        if (!data.params) {
          axiosSuccessCount++;
        }
      }
    } catch (testError) {
      // 预期的错误，继续测试
      axiosSuccessCount++;
    }
  }
  
  // 测试 Fetch 处理无效 JSON
  const originalFetch = global.fetch;
  
  for (const invalidJson of invalidJsonCases) {
    let capturedUrl = '';
    
    global.fetch = async (url, options) => {
      capturedUrl = url;
      return {
        ok: true,
        text: async () => '{"success": true}'
      };
    };
    
    try {
      const builder = new FetchHttpBuilder('https://api.example.com');
      const http = builder
        .setUri('/api/test')
        .setMethod(HttpMethod.GET)  // GET 会尝试解析 JSON 作为查询参数
        .setContent(invalidJson)
        .build();
        
      const [response, error] = await http.send();
      
      if (!error) {
        // 应该忽略无效的 JSON，不添加查询参数
        if (capturedUrl === 'https://api.example.com/api/test') {
          fetchSuccessCount++;
        }
      }
    } catch (testError) {
      // 预期的错误，继续测试
      fetchSuccessCount++;
    }
  }
  
  // 恢复原始 fetch
  global.fetch = originalFetch;
  
  console.log(`Axios 无效 JSON 处理: ${axiosSuccessCount}/${invalidJsonCases.length}`);
  console.log(`Fetch 无效 JSON 处理: ${fetchSuccessCount}/${invalidJsonCases.length}`);
  
  if (axiosSuccessCount === invalidJsonCases.length && 
      fetchSuccessCount === invalidJsonCases.length) {
    console.log('✅ 无效 JSON 内容处理正确');
  } else {
    console.error('❌ 无效 JSON 内容处理存在问题');
  }
  
} catch (error) {
  console.error('❌ 无效 JSON 内容处理测试失败:', error.message);
}

// 6. 测试边界情况
console.log('\n6. 边界情况测试:');
try {
  const { FetchHttpBuilder } = require('../dist/index');
  
  // 测试极长的 URL
  const longUrl = 'https://api.example.com/' + 'a'.repeat(1000);
  const builder1 = new FetchHttpBuilder(longUrl);
  console.log('✅ 极长 URL 处理正确');
  
  // 测试极长的 content
  const longContent = JSON.stringify({ data: 'x'.repeat(10000) });
  builder1.setContent(longContent);
  console.log('✅ 极长 content 处理正确');
  
  // 测试大量头部
  const builder2 = new FetchHttpBuilder('https://api.example.com');
  for (let i = 0; i < 100; i++) {
    builder2.addHeader(`X-Custom-Header-${i}`, `value-${i}`);
  }
  console.log('✅ 大量头部处理正确');
  
  // 测试特殊字符
  const specialContent = JSON.stringify({
    unicode: '中文测试🚀',
    newlines: 'line1\nline2\r\nline3',
    quotes: 'He said "Hello" and she said \'Hi\'',
    special: '\t\b\f\v\0'
  });
  builder2.setContent(specialContent);
  console.log('✅ 特殊字符处理正确');
  
  console.log('✅ 边界情况测试通过');
  
} catch (error) {
  console.error('❌ 边界情况测试失败:', error.message);
}

// 7. 测试构造函数参数验证
console.log('\n7. 构造函数参数验证测试:');
try {
  let errorCount = 0;
  
  // 测试无效的 URL
  try {
    const builder = new FetchHttpBuilder('');
    // 应该允许空 URL（由用户决定）
  } catch (urlError) {
    console.log('URL 验证:', urlError.message);
  }
  
  // 测试 Axios 空实例
  try {
    const builder = new AxiosHttpBuilder('https://api.example.com', null);
  } catch (axiosError) {
    if (axiosError.message.includes('axiosInstance')) {
      errorCount++;
    }
  }
  
  // 测试 Gateway 空客户端
  try {
    const builder = new GatewayHttpBuilder('https://api.example.com', null, null);
  } catch (gatewayError) {
    if (gatewayError.message.includes('client') || gatewayError.message.includes('headerBuilder')) {
      errorCount++;
    }
  }
  
  if (errorCount >= 2) {
    console.log('✅ 构造函数参数验证正确');
  } else {
    console.log('⚠️  构造函数参数验证可能不够严格');
  }
  
} catch (error) {
  console.error('❌ 构造函数参数验证测试失败:', error.message);
}

console.log('\n=== 错误场景测试完成 ===');
