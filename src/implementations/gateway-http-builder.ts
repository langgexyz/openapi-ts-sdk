import { HttpBuilder, Http, HttpMethod } from '../core';
import { GatewayClient, HeaderBuilder } from '../core/gateway.interface';

/**
 * Gateway SDK HTTP Builder 实现
 */
export class GatewayHttpBuilder extends HttpBuilder {
  private client: GatewayClient;
  private headerBuilderClass: new () => HeaderBuilder;

  constructor(url: string, client: GatewayClient, headerBuilderClass: new () => HeaderBuilder) {
    super(url);
    this.client = client;
    this.headerBuilderClass = headerBuilderClass;
  }

  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          // 使用传入的 HeaderBuilder 类
          const headerBuilder = new this.headerBuilderClass();
          
          // 使用 Gateway SDK 的代理功能
          const proxyHeaders = headerBuilder
            .setProxy(`${this.baseUrl_}${this.uri_}`, this.method_)
            .build();

          // 合并自定义头部
          for (const [key, value] of this.headers_) {
            proxyHeaders[key] = value;
          }

          const result = await this.client.send(
            'API/Proxy', 
            this.content_ || {}, 
            String, 
            proxyHeaders
          );
          
          // 如果有 pusher，推送响应数据
          if (this.pusher_) {
            this.pusher_(result);
          }

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
