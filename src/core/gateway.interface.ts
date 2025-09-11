/**
 * Gateway SDK 接口定义，避免直接依赖 gateway-ts-sdk 包
 */

export interface GatewayHeaders {
  [key: string]: string;
}

/**
 * 头部构建器接口 - 只需要代理设置和构建方法
 */
export interface HeaderBuilder {
  setProxy(url: string, method: string): HeaderBuilder;
  build(): GatewayHeaders;
}

/**
 * Gateway 客户端接口 - 只需要发送请求的方法
 */
export interface GatewayClient {
  send(command: string, data: any, responseType: any, headers?: GatewayHeaders): Promise<any>;
}
