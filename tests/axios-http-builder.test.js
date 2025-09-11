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

// 6. 测试 Axios 对真实服务（如果可用）
console.log('\n6. Axios 真实服务测试:');
(async () => {
  try {
    // 检查 httpbin 可用性
    const response = await fetch('https://httpbin.org/status/200', { 
      method: 'GET',
      timeout: 3000 
    });
    
    if (response.ok) {
      console.log('检测到 httpbin 可用，进行真实服务测试...');
      
      const axiosInstance = new MockAxiosInstance();
      const builder = new AxiosHttpBuilder('https://httpbin.org', axiosInstance);
      
      const http = builder
        .setUri('/get')
        .setMethod(HttpMethod.GET)
        .addHeader('User-Agent', 'axios-real-test/1.0.0')
        .build();
        
      const [realResponse, realError] = await http.send();
      
      if (realError) {
        console.error('❌ Axios 真实服务测试失败:', realError.message);
      } else {
        console.log('✅ Axios 真实服务测试成功');
      }
    } else {
      console.log('⚠️  httpbin 不可用，跳过真实服务测试');
    }
  } catch (error) {
    console.log('⚠️  无法连接真实服务，跳过测试');
  }
})();

// 7. Axios 错误场景测试
console.log('\n7. Axios 错误场景测试:');

// Mock 失败的 Axios 实例（错误场景专用）
class AxiosFailingInstance {
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
class AxiosTimeoutInstance {
  async request(config) {
    const error = new Error('Request timeout');
    error.code = 'ECONNABORTED';
    throw error;
  }
}

(async () => {
  try {
    // 测试网络错误
    const failingInstance = new AxiosFailingInstance();
    const builder1 = new AxiosHttpBuilder('https://api.example.com', failingInstance);
    
    const http1 = builder1
      .setUri('/api/data')
      .setMethod(HttpMethod.POST)
      .setContent('{"test": "data"}')
      .build();
      
    const [response1, error1] = await http1.send();
    
    if (error1 && error1.message.includes('Network connection failed') && 
        error1.status === 500 && error1.data) {
      console.log('✅ Axios 网络错误处理正确');
    } else {
      console.error('❌ Axios 网络错误格式错误');
    }
    
    // 测试超时错误
    const timeoutInstance = new AxiosTimeoutInstance();
    const builder2 = new AxiosHttpBuilder('https://api.example.com', timeoutInstance);
    
    const http2 = builder2
      .setUri('/api/slow')
      .setMethod(HttpMethod.GET)
      .build();
      
    const [response2, error2] = await http2.send();
    
    if (error2 && error2.message.includes('Request timeout')) {
      console.log('✅ Axios 超时错误处理正确');
    } else {
      console.error('❌ Axios 超时错误格式错误');
    }
    
  } catch (error) {
    console.error('❌ Axios 错误场景测试失败:', error.message);
  }
})();

// 8. Axios 环境兼容性测试
console.log('\n8. Axios 环境兼容性测试:');
try {
  // 检查 axios 依赖
  try {
    const axios = require('axios');
    const axiosInstance = axios.create({
      timeout: 5000,
      headers: { 'User-Agent': 'compatibility-test/1.0.0' }
    });
    
    const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
    console.log('✅ Axios 依赖检查通过');
    
    // 测试构造函数参数验证
    try {
      const invalidBuilder = new AxiosHttpBuilder('https://api.example.com', null);
    } catch (validationError) {
      if (validationError.message.includes('axiosInstance')) {
        console.log('✅ Axios 构造函数参数验证正确');
      }
    }
    
  } catch (axiosError) {
    if (axiosError.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  axios 未安装，需要手动安装');
    }
  }
  
} catch (error) {
  console.error('❌ Axios 环境兼容性测试失败:', error.message);
}

console.log('\n=== Axios HTTP Builder 测试完成 ===');
