// 真实服务集成测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== 真实服务集成测试 ===');
console.log('注意：此测试需要启动以下服务：');
console.log('1. midway-demo-test (端口 7001)');
console.log('2. gateway-go-server (端口 18443)');
console.log('');

// 配置
const MIDWAY_BASE_URL = 'http://localhost:7001';
const GATEWAY_WS_URL = 'ws://localhost:18443';

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查服务是否可用
async function checkServiceAvailability() {
  console.log('检查服务可用性...');
  
  // 检查 midway-demo-test
  try {
    const response = await fetch(`${MIDWAY_BASE_URL}/ping`);
    if (response.ok) {
      console.log('✅ midway-demo-test 服务可用');
    } else {
      console.log('⚠️  midway-demo-test 服务响应异常');
    }
  } catch (error) {
    console.log('❌ midway-demo-test 服务不可用:', error.message);
    console.log('   请启动 midway-demo-test: npm run dev');
  }
  
  // 检查 gateway-go-server
  try {
    // 简单的 WebSocket 连接测试
    const ws = new (require('ws'))(GATEWAY_WS_URL);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('连接超时'));
      }, 3000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        console.log('✅ gateway-go-server 服务可用');
        ws.close();
        resolve();
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  } catch (error) {
    console.log('❌ gateway-go-server 服务不可用:', error.message);
    console.log('   请启动 gateway-go-server: make build && ./bin/gateway-go-server');
  }
}

// 1. Fetch 实现测试 - 直接调用 midway-demo-test
async function testFetchImplementation() {
  console.log('\n1. Fetch 实现测试 - midway-demo-test:');
  
  try {
    const builder = new FetchHttpBuilder(MIDWAY_BASE_URL);
    
    // 测试 GET 请求
    const getHttp = builder
      .setUri('/ping')
      .setMethod(HttpMethod.GET)
      .addHeader('User-Agent', 'ts-sdk-client-test/1.0.0')
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Fetch GET 请求失败:', getError.message);
    } else {
      console.log('✅ Fetch GET 请求成功:', getResponse);
    }
    
    // 测试 POST 请求
    const postHttp = builder
      .setUri('/api/test')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ message: 'test from ts-sdk-client' }))
      .build();
      
    const [postResponse, postError] = await postHttp.send();
    
    if (postError) {
      console.error('❌ Fetch POST 请求失败:', postError.message);
    } else {
      console.log('✅ Fetch POST 请求成功:', postResponse);
    }
    
  } catch (error) {
    console.error('❌ Fetch 实现测试失败:', error.message);
  }
}

// 2. Axios 实现测试 - 使用真实 axios 调用 midway-demo-test
async function testAxiosImplementation() {
  console.log('\n2. Axios 实现测试 - midway-demo-test:');
  
  try {
    // 尝试导入 axios
    const axios = require('axios');
    
    // 创建 axios 实例
    const axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'ts-sdk-client-test/1.0.0'
      }
    });
    
    const builder = new AxiosHttpBuilder(MIDWAY_BASE_URL, axiosInstance);
    
    // 测试 GET 请求
    const getHttp = builder
      .setUri('/ping')
      .setMethod(HttpMethod.GET)
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Axios GET 请求失败:', getError.message);
    } else {
      console.log('✅ Axios GET 请求成功:', getResponse);
    }
    
    // 测试 POST 请求
    const postHttp = builder
      .setUri('/api/test')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ 
        message: 'test from ts-sdk-client axios',
        timestamp: new Date().toISOString()
      }))
      .build();
      
    const [postResponse, postError] = await postHttp.send();
    
    if (postError) {
      console.error('❌ Axios POST 请求失败:', postError.message);
    } else {
      console.log('✅ Axios POST 请求成功:', postResponse);
    }
    
    // 测试 GET 请求参数转换
    const getWithParamsHttp = builder
      .setUri('/api/query')
      .setMethod(HttpMethod.GET)
      .setContent(JSON.stringify({ 
        query: 'test search',
        limit: 10,
        offset: 0
      }))
      .build();
      
    const [paramsResponse, paramsError] = await getWithParamsHttp.send();
    
    if (paramsError) {
      console.error('❌ Axios GET 参数请求失败:', paramsError.message);
    } else {
      console.log('✅ Axios GET 参数请求成功:', paramsResponse);
    }
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  axios 未安装，跳过 Axios 测试');
      console.log('   可以安装 axios: npm install axios');
    } else {
      console.error('❌ Axios 实现测试失败:', error.message);
    }
  }
}

// 3. Gateway 实现测试 - 通过 gateway-go-server 代理到 midway-demo-test
async function testGatewayImplementation() {
  console.log('\n3. Gateway 实现测试 - gateway-go-server:');
  
  try {
    // 尝试导入 gateway-ts-sdk
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    
    // 创建 Gateway 客户端
    const gatewayClient = createClient(GATEWAY_WS_URL, 'ts-sdk-client-test');
    
    // 等待连接建立
    await delay(1000);
    
    const headerBuilder = new HeaderBuilder();
    const builder = new GatewayHttpBuilder(MIDWAY_BASE_URL, gatewayClient, headerBuilder);
    
    // 测试通过 Gateway 代理的 GET 请求
    const getHttp = builder
      .setUri('/ping')
      .setMethod(HttpMethod.GET)
      .addHeader('User-Agent', 'ts-sdk-client-gateway-test/1.0.0')
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Gateway GET 请求失败:', getError.message);
    } else {
      console.log('✅ Gateway GET 请求成功:', getResponse);
    }
    
    // 测试通过 Gateway 代理的 POST 请求
    const postHttp = builder
      .setUri('/api/test')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ 
        message: 'test from ts-sdk-client via gateway',
        timestamp: new Date().toISOString(),
        source: 'gateway-proxy'
      }))
      .build();
      
    const [postResponse, postError] = await postHttp.send();
    
    if (postError) {
      console.error('❌ Gateway POST 请求失败:', postError.message);
    } else {
      console.log('✅ Gateway POST 请求成功:', postResponse);
    }
    
    // 关闭 Gateway 连接
    gatewayClient.close();
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  gateway-ts-sdk 未安装，跳过 Gateway 测试');
      console.log('   Gateway SDK 位于项目目录: ../gateway-ts-sdk');
    } else {
      console.error('❌ Gateway 实现测试失败:', error.message);
    }
  }
}

// 4. 性能对比测试
async function testPerformanceComparison() {
  console.log('\n4. 性能对比测试:');
  
  const iterations = 5;
  const results = {};
  
  // Fetch 性能测试
  try {
    console.log(`测试 Fetch 实现 (${iterations} 次请求)...`);
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const builder = new FetchHttpBuilder(MIDWAY_BASE_URL);
      const http = builder
        .setUri('/ping')
        .setMethod(HttpMethod.GET)
        .build();
        
      const [response, error] = await http.send();
      if (error) {
        throw error;
      }
    }
    
    results.fetch = Date.now() - startTime;
    console.log(`✅ Fetch 实现: ${results.fetch}ms`);
  } catch (error) {
    console.error('❌ Fetch 性能测试失败:', error.message);
  }
  
  // Axios 性能测试
  try {
    const axios = require('axios');
    const axiosInstance = axios.create({ timeout: 10000 });
    
    console.log(`测试 Axios 实现 (${iterations} 次请求)...`);
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const builder = new AxiosHttpBuilder(MIDWAY_BASE_URL, axiosInstance);
      const http = builder
        .setUri('/ping')
        .setMethod(HttpMethod.GET)
        .build();
        
      const [response, error] = await http.send();
      if (error) {
        throw error;
      }
    }
    
    results.axios = Date.now() - startTime;
    console.log(`✅ Axios 实现: ${results.axios}ms`);
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error('❌ Axios 性能测试失败:', error.message);
    }
  }
  
  // 输出性能对比
  if (results.fetch && results.axios) {
    const faster = results.fetch < results.axios ? 'Fetch' : 'Axios';
    const difference = Math.abs(results.fetch - results.axios);
    console.log(`\n性能对比: ${faster} 更快，差距 ${difference}ms`);
  }
}

// 主测试流程
async function runTests() {
  try {
    await checkServiceAvailability();
    
    console.log('\n开始集成测试...');
    
    await testFetchImplementation();
    await delay(500);
    
    await testAxiosImplementation();
    await delay(500);
    
    await testGatewayImplementation();
    await delay(500);
    
    await testPerformanceComparison();
    
  } catch (error) {
    console.error('❌ 测试流程失败:', error.message);
  }
  
  console.log('\n=== 真实服务集成测试完成 ===');
}

// 如果直接运行此文件
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  checkServiceAvailability,
  testFetchImplementation,
  testAxiosImplementation,
  testGatewayImplementation,
  testPerformanceComparison
};
