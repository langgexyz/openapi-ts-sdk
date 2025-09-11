// 环境兼容性测试
const { 
  AxiosHttpBuilder, 
  FetchHttpBuilder,
  GatewayHttpBuilder,
  HttpMethod 
} = require('../dist/index');

console.log('=== 环境兼容性测试 ===');

// 1. 运行时环境检查
console.log('\n1. 运行时环境检查:');
try {
  const runtimeInfo = {
    isNodeJs: typeof process !== 'undefined' && process.versions != null && process.versions.node != null,
    nodeVersion: typeof process !== 'undefined' ? process.version : undefined,
    hasFetch: typeof fetch !== 'undefined',
    hasGlobal: typeof global !== 'undefined',
    hasWindow: typeof window !== 'undefined'
  };
  
  console.log('运行时环境信息:');
  console.log(JSON.stringify(runtimeInfo, null, 2));
  
  if (runtimeInfo.isNodeJs) {
    console.log('✅ 在 Node.js 环境中运行');
  } else {
    console.log('✅ 在浏览器环境中运行');
  }
  
} catch (error) {
  console.error('❌ 运行时环境检查失败:', error.message);
}

// 2. CommonJS 模块导入测试
console.log('\n2. CommonJS 模块导入测试:');
try {
  // 测试所有导出是否可用
  const exports = [
    'AxiosHttpBuilder',
    'FetchHttpBuilder', 
    'GatewayHttpBuilder',
    'HttpMethod'
  ];
  
  let missingExports = [];
  
  if (typeof AxiosHttpBuilder !== 'function') missingExports.push('AxiosHttpBuilder');
  if (typeof FetchHttpBuilder !== 'function') missingExports.push('FetchHttpBuilder');
  if (typeof GatewayHttpBuilder !== 'function') missingExports.push('GatewayHttpBuilder');
  if (typeof HttpMethod !== 'object') missingExports.push('HttpMethod');
  
  if (missingExports.length === 0) {
    console.log('✅ 所有模块正确导出');
  } else {
    console.error(`❌ 缺少导出: ${missingExports.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ CommonJS 模块导入测试失败:', error.message);
}

// 3. 可选依赖检查
console.log('\n3. 可选依赖检查:');
try {
  const dependencies = {
    axios: false,
    'gateway-ts-sdk': false,
    ws: false
  };
  
  // 检查 axios
  try {
    require('axios');
    dependencies.axios = true;
    console.log('✅ axios 可用');
  } catch {
    console.log('⚠️  axios 不可用 (可选依赖)');
  }
  
  // 检查 gateway-ts-sdk
  try {
    require('gateway-ts-sdk');
    dependencies['gateway-ts-sdk'] = true;
    console.log('✅ gateway-ts-sdk 可用');
  } catch {
    console.log('⚠️  gateway-ts-sdk 不可用 (可选依赖)');
  }
  
  // 检查 ws (WebSocket)
  try {
    require('ws');
    dependencies.ws = true;
    console.log('✅ ws 可用');
  } catch {
    console.log('⚠️  ws 不可用 (可选依赖)');
  }
  
  console.log('依赖状态:', dependencies);
  
} catch (error) {
  console.error('❌ 可选依赖检查失败:', error.message);
}

// 4. FetchHttpBuilder 环境兼容性
console.log('\n4. FetchHttpBuilder 环境兼容性测试:');
try {
  const hasFetch = typeof fetch !== 'undefined';
  
  if (hasFetch) {
    console.log('✅ Fetch API 可用');
    
    // 测试构建
    const builder = new FetchHttpBuilder('https://api.example.com');
    console.log('✅ FetchHttpBuilder 在支持环境中构建成功');
  } else {
    console.log('⚠️  Fetch API 不可用（Node.js 环境）');
    
    // 尝试构建，应该在构造函数中检测环境
    try {
      const builder = new FetchHttpBuilder('https://api.example.com');
      console.log('⚠️  FetchHttpBuilder 在不支持环境中仍能构建（可能需要 polyfill）');
    } catch (fetchError) {
      if (fetchError.message.includes('Fetch API is not available')) {
        console.log('✅ FetchHttpBuilder 正确检测环境不支持');
      } else {
        console.error('❌ FetchHttpBuilder 环境检测错误:', fetchError.message);
      }
    }
  }
  
} catch (error) {
  console.error('❌ FetchHttpBuilder 环境兼容性测试失败:', error.message);
}

// 5. AxiosHttpBuilder 依赖检查
console.log('\n5. AxiosHttpBuilder 依赖检查测试:');
try {
  try {
    const axios = require('axios');
    
    // 测试创建 axios 实例
    const axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        'User-Agent': 'compatibility-test/1.0.0'
      }
    });
    
    const builder = new AxiosHttpBuilder('https://api.example.com', axiosInstance);
    console.log('✅ AxiosHttpBuilder 依赖检查通过');
    
  } catch (axiosError) {
    if (axiosError.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  axios 未安装，AxiosHttpBuilder 需要手动安装 axios');
      console.log('   安装命令: npm install axios');
    } else {
      console.error('❌ AxiosHttpBuilder 依赖检查失败:', axiosError.message);
    }
  }
  
} catch (error) {
  console.error('❌ AxiosHttpBuilder 依赖检查测试失败:', error.message);
}

// 6. GatewayHttpBuilder 依赖检查
console.log('\n6. GatewayHttpBuilder 依赖检查测试:');
try {
  try {
    const { createClient, HeaderBuilder } = require('gateway-ts-sdk');
    
    // 测试创建 Gateway 客户端（不实际连接）
    console.log('✅ gateway-ts-sdk 模块可用');
    console.log('✅ GatewayHttpBuilder 依赖检查通过');
    
  } catch (gatewayError) {
    if (gatewayError.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  gateway-ts-sdk 未安装，GatewayHttpBuilder 需要 gateway-ts-sdk');
      console.log('   该依赖位于项目目录: ../gateway-ts-sdk');
    } else {
      console.error('❌ GatewayHttpBuilder 依赖检查失败:', gatewayError.message);
    }
  }
  
} catch (error) {
  console.error('❌ GatewayHttpBuilder 依赖检查测试失败:', error.message);
}

// 7. TypeScript 类型兼容性检查
console.log('\n7. TypeScript 类型兼容性检查:');
try {
  // 检查编译输出是否包含类型定义
  const fs = require('fs');
  const path = require('path');
  
  const distPath = path.join(__dirname, '../dist');
  const typeFiles = [
    'index.d.ts',
    'axios/axios-http-builder.d.ts',
    'fetch/fetch-http-builder.d.ts',
    'gateway/gateway-http-builder.d.ts',
    'core/http-builder.abstract.d.ts'
  ];
  
  let missingTypes = [];
  
  for (const typeFile of typeFiles) {
    const filePath = path.join(distPath, typeFile);
    if (!fs.existsSync(filePath)) {
      missingTypes.push(typeFile);
    }
  }
  
  if (missingTypes.length === 0) {
    console.log('✅ TypeScript 类型定义文件完整');
  } else {
    console.error(`❌ 缺少类型定义文件: ${missingTypes.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ TypeScript 类型兼容性检查失败:', error.message);
}

// 8. package.json 兼容性检查
console.log('\n8. package.json 兼容性检查:');
try {
  const fs = require('fs');
  const path = require('path');
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredFields = ['main', 'types', 'exports'];
  let missingFields = [];
  
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length === 0) {
    console.log('✅ package.json 包含必需字段');
  } else {
    console.error(`❌ package.json 缺少字段: ${missingFields.join(', ')}`);
  }
  
  // 检查入口文件
  if (packageJson.main && packageJson.main.includes('dist/')) {
    console.log('✅ package.json 主入口指向编译输出');
  } else {
    console.error('❌ package.json 主入口应该指向 dist/ 目录');
  }
  
  if (packageJson.types && packageJson.types.includes('dist/') && packageJson.types.endsWith('.d.ts')) {
    console.log('✅ package.json 类型入口正确');
  } else {
    console.error('❌ package.json 类型入口应该指向 dist/ 目录下的 .d.ts 文件');
  }
  
} catch (error) {
  console.error('❌ package.json 兼容性检查失败:', error.message);
}

console.log('\n=== 环境兼容性测试完成 ===');
