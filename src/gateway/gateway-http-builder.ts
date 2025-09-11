import { HttpBuilder, Http } from '../core';

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

/**
 * Gateway SDK HTTP Builder 实现
 */
export class GatewayHttpBuilder extends HttpBuilder {
  private client: GatewayClient;
  private headerBuilder: HeaderBuilder;

  constructor(url: string, client: GatewayClient, headerBuilder: HeaderBuilder) {
    super(url);
    this.client = client;
    this.headerBuilder = headerBuilder;
  }

  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          // 使用 Gateway SDK 的代理功能
          const proxyHeaders = this.headerBuilder
            .setProxy(`${this.baseUrl_}${this.uri_}`, this.method_)
            .build();

          // 合并自定义头部
          for (const [key, value] of this.headers_) {
            proxyHeaders[key] = value;
          }

          // 使用 Gateway 客户端发送请求
          const result = await this.client.send(
            'API/Proxy', 
            this.content_ || {}, 
            String,
            proxyHeaders
          );
          
          return [result, null];
        } catch (error: any) {
          const httpError = new Error(error.message || 'Gateway request failed');
          
          // 添加更多错误信息
          if (error.code) {
            (httpError as any).code = error.code;
          }
          
          return ['', httpError];
        }
      }
    };
  }

}
