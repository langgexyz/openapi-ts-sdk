// HTTP 实现集成测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== HTTP 实现集成测试 ===');

// Mock HTTP 请求器 (用于测试 Axios 实现)
class MockHttpRequester {
  async request(config) {
    return {
      data: { 
        message: 'mock response', 
        config: config 
      },
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config: config
    };
  }
}

// Mock Gateway 客户端
class MockGatewayClient {
  async sendRaw(command, data, headers) {
    return JSON.stringify({
      message: 'mock gateway response',
      command: command,
      data: data,
      headers: Array.from(headers.entries())
    });
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

// 1. 测试 FetchHttpBuilder 构建
console.log('\n1. FetchHttpBuilder 构建测试:');
try {
  const builder = new FetchHttpBuilder('https://httpbin.org');
  
  const http = builder
    .setUri('/get')
    .setMethod(HttpMethod.GET)
    .addHeader('User-Agent', 'test-client/1.0.0')
    .build();
    
  if (!http || typeof http.send !== 'function') {
    throw new Error('FetchHttpBuilder 应该返回包含 send 方法的对象');
  }
  
  console.log('✅ FetchHttpBuilder 构建成功');
} catch (error) {
  console.error('❌ FetchHttpBuilder 构建失败:', error.message);
}

// 2. 测试 AxiosHttpBuilder 构建
console.log('\n2. AxiosHttpBuilder 构建测试:');
try {
  const mockRequester = new MockHttpRequester();
  const builder = new AxiosHttpBuilder('https://api.example.com', mockRequester);
  
  const http = builder
    .setUri('/api/data')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .setContent('{"test": "data"}')
    .build();
    
  if (!http || typeof http.send !== 'function') {
    throw new Error('AxiosHttpBuilder 应该返回包含 send 方法的对象');
  }
  
  console.log('✅ AxiosHttpBuilder 构建成功');
} catch (error) {
  console.error('❌ AxiosHttpBuilder 构建失败:', error.message);
}

// 3. 测试 GatewayHttpBuilder 构建
console.log('\n3. GatewayHttpBuilder 构建测试:');
try {
  const mockClient = new MockGatewayClient();
  const mockHeaderBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', mockClient, mockHeaderBuilder);
  
  const http = builder
    .setUri('/api/proxy')
    .setMethod(HttpMethod.PUT)
    .addHeader('Content-Type', 'application/json')
    .setContent('{"proxy": "data"}')
    .build();
    
  if (!http || typeof http.send !== 'function') {
    throw new Error('GatewayHttpBuilder 应该返回包含 send 方法的对象');
  }
  
  console.log('✅ GatewayHttpBuilder 构建成功');
} catch (error) {
  console.error('❌ GatewayHttpBuilder 构建失败:', error.message);
}

// 4. 测试 Mock 请求发送
console.log('\n4. Mock 请求发送测试:');

// 测试 Axios Mock 请求
console.log('4.1 Axios Mock 请求:');
try {
  const mockRequester = new MockHttpRequester();
  const builder = new AxiosHttpBuilder('https://api.example.com', mockRequester);
  
  const http = builder
    .setUri('/test')
    .setMethod(HttpMethod.POST)
    .setContent('{"key": "value"}')
    .build();
    
  // 这里实际发送请求到 Mock
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Axios Mock 请求失败:', error.message);
    } else {
      const data = JSON.parse(response);
      if (data.message === 'mock response') {
        console.log('✅ Axios Mock 请求成功');
      } else {
        console.error('❌ Axios Mock 响应格式错误');
      }
    }
  }).catch(err => {
    console.error('❌ Axios Mock 请求异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios Mock 请求测试失败:', error.message);
}

// 测试 Gateway Mock 请求
console.log('4.2 Gateway Mock 请求:');
try {
  const mockClient = new MockGatewayClient();
  const mockHeaderBuilder = new MockHeaderBuilder();
  const builder = new GatewayHttpBuilder('https://api.example.com', mockClient, mockHeaderBuilder);
  
  const http = builder
    .setUri('/proxy-test')
    .setMethod(HttpMethod.GET)
    .setContent('{"proxy": "test"}')
    .build();
    
  // 这里实际发送请求到 Mock
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Gateway Mock 请求失败:', error.message);
    } else {
      const data = JSON.parse(response);
      if (data.message === 'mock gateway response') {
        console.log('✅ Gateway Mock 请求成功');
      } else {
        console.error('❌ Gateway Mock 响应格式错误');
      }
    }
  }).catch(err => {
    console.error('❌ Gateway Mock 请求异常:', err.message);
  });
} catch (error) {
  console.error('❌ Gateway Mock 请求测试失败:', error.message);
}

// 5. 测试 GET 请求参数转换
console.log('\n5. GET 请求参数转换测试:');
try {
  const mockRequester = new MockHttpRequester();
  const builder = new AxiosHttpBuilder('https://api.example.com', mockRequester);
  
  const http = builder
    .setUri('/search')
    .setMethod(HttpMethod.GET)
    .setContent('{"query": "test", "limit": 10}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ GET 参数转换测试失败:', error.message);
    } else {
      const data = JSON.parse(response);
      // 验证参数是否正确转换
      if (data.config && data.config.params) {
        const params = data.config.params;
        if (params.query === 'test' && params.limit === 10) {
          console.log('✅ GET 请求参数转换成功');
        } else {
          console.error('❌ GET 参数转换格式错误');
        }
      } else {
        console.error('❌ GET 参数未正确转换');
      }
    }
  }).catch(err => {
    console.error('❌ GET 参数转换测试异常:', err.message);
  });
} catch (error) {
  console.error('❌ GET 参数转换测试失败:', error.message);
}

console.log('\n=== HTTP 实现集成测试完成 ===');
