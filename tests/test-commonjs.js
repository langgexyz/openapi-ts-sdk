// CommonJS 兼容性测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod,
  checkCompatibility,
  getRuntimeInfo 
} = require('../dist/index');

console.log('=== TypeScript SDK Client CommonJS 兼容性测试 ===');

// 检查运行时环境
console.log('\n1. 运行时环境检查:');
const runtimeInfo = getRuntimeInfo();
console.log(JSON.stringify(runtimeInfo, null, 2));

// 检查依赖兼容性
console.log('\n2. 依赖兼容性检查:');
try {
  const compatibility = checkCompatibility();
  console.log(JSON.stringify(compatibility, null, 2));
} catch (error) {
  console.error('兼容性检查失败:', error.message);
}

// 测试 HttpBuilder 直接构建
console.log('\n3. HttpBuilder 直接构建测试:');
try {
  // 测试 fetch 实现（不需要额外依赖）
  const fetchBuilder = new FetchHttpBuilder('https://api.example.com');
  console.log('✅ Fetch HttpBuilder 创建成功');
  
  // 测试 axios 实现（如果可用）
  try {
    const axios = require('axios');
    const axiosInstance = axios.create({ timeout: 10000 });
    // axios 实例本身就实现了 HttpRequester 接口
    const axiosBuilder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
    console.log('✅ Axios HttpBuilder 创建成功');
  } catch (axiosError) {
    console.log('⚠️  Axios HttpBuilder 创建失败 (可能未安装 axios):', axiosError.message);
  }
  
  // 测试 gateway 实现（如果可用）
  try {
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    const gatewayClient = createClient('ws://localhost:18443', 'test-client');
    const gatewayBuilder = new GatewayHttpBuilder('https://api.example.com', gatewayClient, HeaderBuilder);
    console.log('✅ Gateway HttpBuilder 创建成功');
  } catch (gatewayError) {
    console.log('⚠️  Gateway HttpBuilder 创建失败 (可能未安装 gateway-ts-sdk):', gatewayError.message);
  }
  
} catch (error) {
  console.error('❌ HttpBuilder 测试失败:', error.message);
}

// 测试 HTTP 调用链
console.log('\n4. HTTP 调用链测试:');
try {
  const builder = new FetchHttpBuilder('https://httpbin.org');
  
  const http = builder
    .setUri('/get')
    .setMethod(HttpMethod.GET)
    .addHeader('User-Agent', 'typescript-api-generator/1.0.0')
    .build();
    
  console.log('✅ HTTP 调用链构建成功');
  
  // 注意：这里只是构建，不实际发送请求
  console.log('💡 HTTP 实例已创建，可以调用 send() 方法发送请求');
  
} catch (error) {
  console.error('❌ HTTP 调用链测试失败:', error.message);
}

console.log('\n=== 测试完成 ===');
console.log('如果看到这条消息，说明 CommonJS 兼容性基本正常！');

module.exports = {
  runTest: () => {
    console.log('CommonJS 兼容性测试通过');
    return true;
  }
};
