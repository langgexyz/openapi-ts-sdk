// Axios HTTP Builder 单元测试
const { AxiosHttpBuilder, HttpMethod } = require('../dist/index');

console.log('=== Axios HTTP Builder 测试 ===');

// Mock Axios 实例
class MockAxiosInstance {
  async request(config) {
    return {
      data: { 
        message: 'axios mock response', 
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
        params: config.params
      },
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config: config
    };
  }
}

// 失败的 Axios 实例
class FailingAxiosInstance {
  async request(config) {
    const error = new Error('Axios request failed');
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { error: 'Server error' }
    };
    throw error;
  }
}

// 1. 测试 AxiosHttpBuilder 构建
console.log('\n1. AxiosHttpBuilder 构建测试:');
try {
  const axiosInstance = new MockAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
  
  const http = builder
    .setUri('/api/users')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .addHeader('Authorization', 'Bearer token123')
    .setContent('{"name": "John", "email": "john@example.com"}')
    .build();
    
  if (!http || typeof http.send !== 'function') {
    throw new Error('AxiosHttpBuilder 应该返回包含 send 方法的对象');
  }
  
  console.log('✅ AxiosHttpBuilder 构建成功');
} catch (error) {
  console.error('❌ AxiosHttpBuilder 构建失败:', error.message);
}

// 2. 测试 POST 请求
console.log('\n2. Axios POST 请求测试:');
try {
  const axiosInstance = new MockAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
  
  const http = builder
    .setUri('/api/users')
    .setMethod(HttpMethod.POST)
    .addHeader('Content-Type', 'application/json')
    .setContent('{"name": "Alice", "role": "admin"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Axios POST 请求失败:', error.message);
    } else {
      const data = JSON.parse(response);
      if (data.method === 'post' && data.data) {
        console.log('✅ Axios POST 请求成功');
      } else {
        console.error('❌ Axios POST 响应格式错误');
      }
    }
  }).catch(err => {
    console.error('❌ Axios POST 请求异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios POST 请求测试失败:', error.message);
}

// 3. 测试 GET 请求参数转换
console.log('\n3. Axios GET 参数转换测试:');
try {
  const axiosInstance = new MockAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
  
  const http = builder
    .setUri('/api/search')
    .setMethod(HttpMethod.GET)
    .setContent('{"query": "typescript", "limit": 10, "page": 1}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Axios GET 参数转换失败:', error.message);
    } else {
      const data = JSON.parse(response);
      if (data.params && data.params.query === 'typescript') {
        console.log('✅ Axios GET 参数转换成功');
      } else {
        console.error('❌ Axios GET 参数转换格式错误');
      }
    }
  }).catch(err => {
    console.error('❌ Axios GET 参数转换异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios GET 参数转换测试失败:', error.message);
}

// 4. 测试 Axios 错误处理
console.log('\n4. Axios 错误处理测试:');
try {
  const failingInstance = new FailingAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', failingInstance);
  
  const http = builder
    .setUri('/api/failing')
    .setMethod(HttpMethod.POST)
    .setContent('{"test": "data"}')
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      if (error.message.includes('Axios request failed') && error.status === 500) {
        console.log('✅ Axios 错误处理正确');
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

// 5. 测试无效的 JSON content
console.log('\n5. Axios 无效 JSON content 测试:');
try {
  const axiosInstance = new MockAxiosInstance();
  const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
  
  const http = builder
    .setUri('/api/search')
    .setMethod(HttpMethod.GET)
    .setContent('invalid json content')  // 无效的 JSON
    .build();
    
  http.send().then(([response, error]) => {
    if (error) {
      console.error('❌ Axios 无效 JSON 处理失败:', error.message);
    } else {
      const data = JSON.parse(response);
      // 应该忽略无效的 JSON content，不设置 params
      if (!data.params) {
        console.log('✅ Axios 无效 JSON content 正确忽略');
      } else {
        console.error('❌ Axios 应该忽略无效 JSON content');
      }
    }
  }).catch(err => {
    console.error('❌ Axios 无效 JSON 处理异常:', err.message);
  });
} catch (error) {
  console.error('❌ Axios 无效 JSON content 测试失败:', error.message);
}

console.log('\n=== Axios HTTP Builder 测试完成 ===');
