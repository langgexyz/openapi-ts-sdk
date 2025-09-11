// 真实服务集成测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== 真实服务集成测试 ===');
console.log('注意：此测试需要启动以下服务：');
console.log('1. midway-ts-server (端口 7001)');
console.log('2. gateway-go-server (端口 18443)');
console.log('');

// 服务配置
const SERVICES = {
  midway: 'http://localhost:7001',
  gateway: 'ws://localhost:18443',
  httpbin: 'https://httpbin.org'  // 公共测试服务
};

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 服务可用性检查
async function checkServiceAvailability() {
  console.log('检查服务可用性...\n');
  
  const results = {
    midway: false,
    gateway: false,
    httpbin: false
  };
  
  // 检查 midway-ts-server
  try {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(`${SERVICES.midway}/ping`, { 
        method: 'GET',
        timeout: 3000 
      });
      results.midway = response.ok;
    } else {
      console.log('⚠️  无法检查 midway 服务 (fetch 不可用)');
    }
  } catch (error) {
    // 服务不可用
  }
  
  // 检查 gateway-go-server
  try {
    const WebSocket = require('ws');
    const ws = new WebSocket(SERVICES.gateway);
    
    results.gateway = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 3000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      });
      
      ws.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  } catch (error) {
    // ws 模块不可用或服务不可用
  }
  
  // 检查 httpbin (公共服务)
  try {
    if (typeof fetch !== 'undefined') {
      const response = await fetch(`${SERVICES.httpbin}/status/200`, {
        method: 'GET',
        timeout: 5000
      });
      results.httpbin = response.ok;
    }
  } catch (error) {
    // 网络问题或服务不可用
  }
  
  // 输出结果
  console.log('服务可用性检查结果:');
  console.log(`midway-ts-server: ${results.midway ? '✅ 可用' : '❌ 不可用'}`);
  console.log(`gateway-go-server: ${results.gateway ? '✅ 可用' : '❌ 不可用'}`);
  console.log(`httpbin (公共服务): ${results.httpbin ? '✅ 可用' : '❌ 不可用'}`);
  
  return results;
}

// 测试 FetchHttpBuilder 对真实服务
async function testFetchRealServices(serviceStatus) {
  console.log('\n=== FetchHttpBuilder 真实服务测试 ===');
  
  if (!serviceStatus.httpbin) {
    console.log('⚠️  跳过 Fetch 测试 (httpbin 不可用)');
    return;
  }
  
  try {
    const builder = new FetchHttpBuilder(SERVICES.httpbin);
    
    // 测试简单 GET 请求
    console.log('\n1. Fetch GET 请求测试:');
    const getHttp = builder
      .setUri('/get')
      .setMethod(HttpMethod.GET)
      .addHeader('User-Agent', 'ts-sdk-client-test/1.0.0')
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Fetch GET 请求失败:', getError.message);
    } else {
      console.log('✅ Fetch GET 请求成功');
      // 可以解析响应查看详情
      try {
        const data = JSON.parse(getResponse);
        if (data.url && data.headers) {
          console.log('✅ Fetch GET 响应格式正确');
        }
      } catch (parseError) {
        console.log('⚠️  Fetch GET 响应解析失败');
      }
    }
    
    // 测试 POST 请求
    console.log('\n2. Fetch POST 请求测试:');
    const postHttp = builder
      .setUri('/post')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ 
        message: 'test from ts-sdk-client',
        timestamp: new Date().toISOString()
      }))
      .build();
      
    const [postResponse, postError] = await postHttp.send();
    
    if (postError) {
      console.error('❌ Fetch POST 请求失败:', postError.message);
    } else {
      console.log('✅ Fetch POST 请求成功');
      try {
        const data = JSON.parse(postResponse);
        if (data.json && data.json.message) {
          console.log('✅ Fetch POST 数据传输正确');
        }
      } catch (parseError) {
        console.log('⚠️  Fetch POST 响应解析失败');
      }
    }
    
    // 测试错误处理
    console.log('\n3. Fetch 错误处理测试:');
    const errorHttp = builder
      .setUri('/status/404')
      .setMethod(HttpMethod.GET)
      .build();
      
    const [errorResponse, errorError] = await errorHttp.send();
    
    if (errorError) {
      if (errorError.message.includes('404')) {
        console.log('✅ Fetch 404 错误处理正确');
      } else {
        console.error('❌ Fetch 错误处理格式错误:', errorError.message);
      }
    } else {
      console.error('❌ Fetch 应该返回 404 错误');
    }
    
  } catch (error) {
    console.error('❌ FetchHttpBuilder 真实服务测试失败:', error.message);
  }
}

// 测试 AxiosHttpBuilder 对真实服务
async function testAxiosRealServices(serviceStatus) {
  console.log('\n=== AxiosHttpBuilder 真实服务测试 ===');
  
  try {
    const axios = require('axios');
    
    if (!serviceStatus.httpbin) {
      console.log('⚠️  跳过 Axios 测试 (httpbin 不可用)');
      return;
    }
    
    const axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'ts-sdk-client-axios-test/1.0.0'
      }
    });
    
    const builder = new AxiosHttpBuilder(SERVICES.httpbin, axiosInstance);
    
    // 测试 GET 请求
    console.log('\n1. Axios GET 请求测试:');
    const getHttp = builder
      .setUri('/get')
      .setMethod(HttpMethod.GET)
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Axios GET 请求失败:', getError.message);
    } else {
      console.log('✅ Axios GET 请求成功');
      try {
        const data = JSON.parse(getResponse);
        if (data.url && data.headers) {
          console.log('✅ Axios GET 响应格式正确');
        }
      } catch (parseError) {
        console.log('⚠️  Axios GET 响应解析失败');
      }
    }
    
    // 测试 GET 请求参数
    console.log('\n2. Axios GET 参数请求测试:');
    const getParamsHttp = builder
      .setUri('/get')
      .setMethod(HttpMethod.GET)
      .setContent(JSON.stringify({ 
        search: 'typescript sdk',
        limit: 10,
        page: 1
      }))
      .build();
      
    const [paramsResponse, paramsError] = await getParamsHttp.send();
    
    if (paramsError) {
      console.error('❌ Axios GET 参数请求失败:', paramsError.message);
    } else {
      console.log('✅ Axios GET 参数请求成功');
      try {
        const data = JSON.parse(paramsResponse);
        if (data.args && data.args.search) {
          console.log('✅ Axios GET 参数传递正确');
        }
      } catch (parseError) {
        console.log('⚠️  Axios GET 参数响应解析失败');
      }
    }
    
    // 测试 POST 请求
    console.log('\n3. Axios POST 请求测试:');
    const postHttp = builder
      .setUri('/post')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ 
        message: 'test from ts-sdk-client axios',
        timestamp: new Date().toISOString(),
        client: 'axios'
      }))
      .build();
      
    const [postResponse, postError] = await postHttp.send();
    
    if (postError) {
      console.error('❌ Axios POST 请求失败:', postError.message);
    } else {
      console.log('✅ Axios POST 请求成功');
      try {
        const data = JSON.parse(postResponse);
        if (data.json && data.json.client === 'axios') {
          console.log('✅ Axios POST 数据传输正确');
        }
      } catch (parseError) {
        console.log('⚠️  Axios POST 响应解析失败');
      }
    }
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  axios 未安装，跳过 Axios 真实服务测试');
    } else {
      console.error('❌ AxiosHttpBuilder 真实服务测试失败:', error.message);
    }
  }
}

// 测试 GatewayHttpBuilder 对真实服务
async function testGatewayRealServices(serviceStatus) {
  console.log('\n=== GatewayHttpBuilder 真实服务测试 ===');
  
  if (!serviceStatus.gateway || !serviceStatus.midway) {
    console.log('⚠️  跳过 Gateway 测试 (gateway 或 midway 服务不可用)');
    return;
  }
  
  try {
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    
    console.log('连接到 Gateway 服务...');
    const gatewayClient = createClient(SERVICES.gateway, 'ts-sdk-client-test');
    
    await delay(1000); // 等待连接建立
    
    const headerBuilder = new HeaderBuilder();
    const builder = new GatewayHttpBuilder(SERVICES.midway, gatewayClient, headerBuilder);
    
    // 测试通过 Gateway 代理的 GET 请求
    console.log('\n1. Gateway 代理 GET 请求测试:');
    const getHttp = builder
      .setUri('/ping')
      .setMethod(HttpMethod.GET)
      .addHeader('User-Agent', 'ts-sdk-client-gateway-test/1.0.0')
      .build();
      
    const [getResponse, getError] = await getHttp.send();
    
    if (getError) {
      console.error('❌ Gateway GET 请求失败:', getError.message);
    } else {
      console.log('✅ Gateway GET 请求成功');
      console.log('响应:', getResponse.substring(0, 100) + '...');
    }
    
    // 测试通过 Gateway 代理的 POST 请求
    console.log('\n2. Gateway 代理 POST 请求测试:');
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
      console.log('✅ Gateway POST 请求成功');
      console.log('响应:', postResponse.substring(0, 100) + '...');
    }
    
    // 关闭连接
    gatewayClient.close();
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  gateway-ts-sdk 未安装，跳过 Gateway 真实服务测试');
    } else {
      console.error('❌ GatewayHttpBuilder 真实服务测试失败:', error.message);
    }
  }
}

// 性能对比测试
async function performanceComparison(serviceStatus) {
  console.log('\n=== 性能对比测试 ===');
  
  if (!serviceStatus.httpbin) {
    console.log('⚠️  跳过性能测试 (httpbin 不可用)');
    return;
  }
  
  const iterations = 3;
  const results = {};
  
  // Fetch 性能测试
  if (typeof fetch !== 'undefined') {
    try {
      console.log(`\n测试 Fetch 实现 (${iterations} 次请求)...`);
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const builder = new FetchHttpBuilder(SERVICES.httpbin);
        const http = builder
          .setUri('/get')
          .setMethod(HttpMethod.GET)
          .build();
          
        const [response, error] = await http.send();
        if (error) throw error;
      }
      
      results.fetch = Date.now() - startTime;
      console.log(`✅ Fetch 实现: ${results.fetch}ms`);
    } catch (error) {
      console.error('❌ Fetch 性能测试失败:', error.message);
    }
  }
  
  // Axios 性能测试
  try {
    const axios = require('axios');
    const axiosInstance = axios.create({ timeout: 10000 });
    
    console.log(`\n测试 Axios 实现 (${iterations} 次请求)...`);
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const builder = new AxiosHttpBuilder(SERVICES.httpbin, axiosInstance);
      const http = builder
        .setUri('/get')
        .setMethod(HttpMethod.GET)
        .build();
        
      const [response, error] = await http.send();
      if (error) throw error;
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
    const slower = results.fetch < results.axios ? 'Axios' : 'Fetch';
    const fasterTime = Math.min(results.fetch, results.axios);
    const slowerTime = Math.max(results.fetch, results.axios);
    const difference = slowerTime - fasterTime;
    const percentage = Math.round((difference / slowerTime) * 100);
    
    console.log(`\n性能对比结果:`);
    console.log(`${faster}: ${fasterTime}ms`);
    console.log(`${slower}: ${slowerTime}ms`);
    console.log(`${faster} 比 ${slower} 快 ${difference}ms (${percentage}%)`);
  }
}

// 主测试流程
async function runIntegrationTests() {
  try {
    const serviceStatus = await checkServiceAvailability();
    
    console.log('\n开始真实服务集成测试...');
    
    await testFetchRealServices(serviceStatus);
    await delay(500);
    
    await testAxiosRealServices(serviceStatus);
    await delay(500);
    
    await testGatewayRealServices(serviceStatus);
    await delay(500);
    
    await performanceComparison(serviceStatus);
    
  } catch (error) {
    console.error('❌ 集成测试流程失败:', error.message);
  }
  
  console.log('\n=== 真实服务集成测试完成 ===');
}

// 如果直接运行此文件
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  checkServiceAvailability,
  testFetchRealServices,
  testAxiosRealServices,
  testGatewayRealServices,
  performanceComparison
};
