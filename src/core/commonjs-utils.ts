/**
 * CommonJS 兼容性工具函数
 */

/**
 * 安全地 require 外部包
 * @param packageName 包名
 */
export function safeRequire(packageName: string): any {
  try {
    return require(packageName);
  } catch (error: any) {
    throw new Error(
      `Package "${packageName}" is not installed. ` +
      `Please install it using: npm install ${packageName}. ` +
      `Error: ${error.message}`
    );
  }
}

/**
 * 兼容 CommonJS 的模块加载
 * @param modulePath 模块路径
 */
export function requireModule(modulePath: string): any {
  try {
    return require(modulePath);
  } catch (error) {
    // 尝试相对路径导入
    try {
      const path = require('path');
      const absolutePath = path.resolve(__dirname, modulePath);
      return require(absolutePath);
    } catch (fallbackError: any) {
      throw new Error(`Failed to load module "${modulePath}": ${fallbackError.message}`);
    }
  }
}

/**
 * 检查是否在 Node.js 环境中
 */
export function isNodeJs(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * 获取运行时环境信息
 */
export function getRuntimeInfo(): {
  isNodeJs: boolean;
  isCommonJS: boolean;
  nodeVersion?: string;
} {
  const nodeJs = isNodeJs();
  
  return {
    isNodeJs: nodeJs,
    isCommonJS: nodeJs && typeof module !== 'undefined' && module.exports,
    nodeVersion: nodeJs ? process.version : undefined
  };
}

/**
 * 检查包是否已安装
 * @param packageName 包名
 */
export function isPackageAvailable(packageName: string): boolean {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全地导入可选依赖
 * @param packageName 包名
 * @param fallback 备用值
 */
export function optionalRequire<T = any>(packageName: string, fallback?: T): T | undefined {
  try {
    return require(packageName);
  } catch {
    return fallback;
  }
}
