/**
 * 运行时环境工具函数
 */

/**
 * 检查是否在 Node.js 环境中
 */
export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * 检查是否在浏览器环境中
 */
export function isBrowserEnvironment(): boolean {
  return typeof (globalThis as any).window !== 'undefined' && 
         typeof (globalThis as any).document !== 'undefined';
}
