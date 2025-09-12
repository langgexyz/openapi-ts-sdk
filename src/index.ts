/**
 * TypeScript SDK Client - 主入口文件
 * 支持多种 HTTP 实现的 TypeScript SDK 客户端库
 */

// 核心接口和类
export * from './core';

// HTTP 实现
export { AxiosHttpBuilder } from './axios';
export { GatewayHttpBuilder } from './gateway';
export { FetchHttpBuilder } from './fetch';

// 从 gateway-ts-sdk 重新导出真实类型
export { HeaderBuilder, StreamGatewayClient as GatewayClient, HttpMethod } from 'gateway-ts-sdk';
