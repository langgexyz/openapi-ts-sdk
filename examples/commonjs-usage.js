// CommonJS 环境使用示例
const axios = require('axios');
const { 
  AxiosHttpBuilder,
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod
} = require('../dist/index');

// 模拟生成的 API 类
class TwitterApi {
  constructor(httpBuilder) {
    this.httpBuilder = httpBuilder;
  }

  // 模拟生成的方法：查询代币推文
  async searchTimeline(request) {
    const http = this.httpBuilder
      .setUri('/api/bigVCall/searchTimeline')
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify(request))
      .build();

    const [response, error] = await http.send();
    
    if (error) {
      throw error;
    }
    
    return JSON.parse(response);
  }

  // 静态工厂方法
  static createWithAxios(baseUrl, httpRequester) {
    const builder = new AxiosHttpBuilder(baseUrl, httpRequester);
    return new TwitterApi(builder);
  }

  static createWithFetch(baseUrl) {
    const builder = new FetchHttpBuilder(baseUrl);
    return new TwitterApi(builder);
  }

  static createWithGateway(baseUrl, gatewayClient, headerBuilderClass) {
    const builder = new GatewayHttpBuilder(baseUrl, gatewayClient, headerBuilderClass);
    return new TwitterApi(builder);
  }
}

async function demonstrateUsage() {
  console.log('=== TypeScript SDK Client CommonJS 使用示例 ===\n');

  const baseUrl = 'https://httpbin.org'; // 使用 httpbin 作为测试
  
  // === 示例 1: 使用自定义 Axios 实例 ===
  console.log('1. 使用自定义 Axios 实例（带拦截器）:');
  
  // 创建带拦截器的 axios 实例
  const customAxios = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'User-Agent': 'typescript-api-generator-example/1.0.0'
    }
  });

  // 添加请求拦截器
  customAxios.interceptors.request.use(
    config => {
      console.log('  📤 发送请求:', config.method?.toUpperCase(), config.url);
      config.headers['X-Request-Time'] = new Date().toISOString();
      return config;
    },
    error => {
      console.error('  ❌ 请求拦截器错误:', error);
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  customAxios.interceptors.response.use(
    response => {
      console.log('  📥 收到响应:', response.status, response.statusText);
      return response;
    },
    error => {
      console.error('  ❌ 响应拦截器错误:', error.message);
      return Promise.reject(error);
    }
  );

  // 使用自定义 axios 实例创建 API
  // axios 实例本身就实现了 HttpRequester 接口，直接传入即可
  const twitterApiWithAxios = TwitterApi.createWithAxios(baseUrl, customAxios);

  try {
    // 模拟调用 (使用 httpbin 的 /post 端点)
    const builder = new AxiosHttpBuilder(baseUrl, customAxios);

    const http = builder
      .setUri('/post') // httpbin 的 POST 测试端点
      .setMethod(HttpMethod.POST)
      .addHeader('Content-Type', 'application/json')
      .setContent(JSON.stringify({ caAddress: '0x1234567890abcdef', test: true }))
      .build();

    const [response, error] = await http.send();
    
    if (error) {
      console.error('  ❌ API 调用失败:', error.message);
    } else {
      const data = JSON.parse(response);
      console.log('  ✅ API 调用成功，收到数据键:', Object.keys(data).join(', '));
    }
  } catch (error) {
    console.error('  ❌ 示例 1 执行失败:', error.message);
  }

  console.log('');

  // === 示例 2: 使用 Fetch 实现 ===
  console.log('2. 使用 Fetch 实现:');
  
  const twitterApiWithFetch = TwitterApi.createWithFetch(baseUrl);

  try {
    const builder = new FetchHttpBuilder(baseUrl);

    const http = builder
      .setUri('/get') // httpbin 的 GET 测试端点
      .setMethod(HttpMethod.GET)
      .addHeader('User-Agent', 'typescript-api-generator-fetch/1.0.0')
      .build();

    const [response, error] = await http.send();
    
    if (error) {
      console.error('  ❌ Fetch 调用失败:', error.message);
    } else {
      const data = JSON.parse(response);
      console.log('  ✅ Fetch 调用成功，来源 IP:', data.origin);
    }
  } catch (error) {
    console.error('  ❌ 示例 2 执行失败:', error.message);
  }

  console.log('');

  // === 示例 3: 实际业务场景模拟 ===
  console.log('3. 实际业务场景模拟（批量请求）:');

  const requests = [
    { endpoint: '/get?param1=value1', method: HttpMethod.GET },
    { endpoint: '/post', method: HttpMethod.POST, data: { type: 'test1' } },
    { endpoint: '/put', method: HttpMethod.PUT, data: { type: 'test2' } }
  ];

  const results = [];

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    try {
      const builder = new FetchHttpBuilder(baseUrl);

      let http = builder
        .setUri(req.endpoint)
        .setMethod(req.method)
        .addHeader('Content-Type', 'application/json')
        .addHeader('X-Request-Index', i.toString());

      if (req.data) {
        http = http.setContent(JSON.stringify(req.data));
      }

      const httpInstance = http.build();
      const [response, error] = await httpInstance.send();
      
      if (error) {
        results.push({ index: i, success: false, error: error.message });
      } else {
        const data = JSON.parse(response);
        results.push({ 
          index: i, 
          success: true, 
          url: data.url || 'unknown',
          method: req.method 
        });
      }
    } catch (error) {
      results.push({ index: i, success: false, error: error.message });
    }
  }

  console.log('  📊 批量请求结果:');
  results.forEach(result => {
    if (result.success) {
      console.log(`    ✅ #${result.index}: ${result.method} ${result.url}`);
    } else {
      console.log(`    ❌ #${result.index}: ${result.error}`);
    }
  });

  console.log('\n=== 示例完成 ===');
  console.log('💡 这展示了如何在 CommonJS 环境中使用 ts-sdk-client');
  console.log('💡 支持自定义 axios 实例、拦截器、以及多种 HTTP 实现');
}

// 如果直接运行此文件
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

module.exports = {
  TwitterApi,
  demonstrateUsage
};
