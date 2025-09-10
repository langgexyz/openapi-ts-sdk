/**
 * TypeScript SDK Client - 主入口文件
 * 支持多种 HTTP 实现的 TypeScript SDK 客户端库
 */

// 核心接口和类
export * from './core';

// HTTP 实现
export * from './implementations';

// 版本信息
export const VERSION = '1.0.0';

/**
 * 检查运行时环境兼容性
 * @returns 环境兼容性信息
 */
export function checkCompatibility(): {
  nodejs: boolean;
  fetch: boolean;
} {
  const { isNodeJs } = require('./core/commonjs-utils');
  
  return {
    nodejs: isNodeJs(),
    fetch: typeof fetch !== 'undefined' || isNodeJs() // Node.js 18+ 有原生 fetch
  };
}
