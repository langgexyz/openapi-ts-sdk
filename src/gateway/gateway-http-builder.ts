import { HttpBuilder, Http, HttpMethod } from '../core';

/**
 * Gateway SDK 核心接口定义
 * 
 * 提供与 gateway-ts-sdk 的接口抽象，避免直接依赖具体实现
 * 支持类型安全的 HTTP 代理转发和原始数据传输
 */

/**
 * 头部构建器接口
 * 
 * 用于构建 HTTP 代理请求的头部信息
 * 支持链式调用，简化头部设置流程
 */
export interface HeaderBuilder {
  /**
   * 设置代理目标信息
   * @param url - 目标 URL
   * @param method - HTTP 方法
   * @returns 返回自身，支持链式调用
   */
  setProxy(url: string, method: string): HeaderBuilder;
  
  /**
   * 构建最终的头部映射
   * @returns 头部映射对象
   */
  build(): Map<string, string>;
}

/**
 * Gateway 客户端接口
 * 
 * 提供与 Gateway 服务的通信能力
 * 支持类型安全的 JSON 通信和原始数据转发
 */
export interface GatewayClient {
  /**
   * 发送类型安全的 JSON 请求
   * 
   * @param command - API 命令路径
   * @param data - 请求数据对象
   * @param responseType - 响应类型构造函数
   * @param headers - 可选请求头部
   * @returns 类型化的响应对象
   */
  send<T>(command: string, data: object, responseType: new() => T, headers?: Map<string, string>): Promise<T>;
  
  /**
   * 发送原始数据请求（用于代理转发）
   * 
   * 直接传输字符串数据，不进行 JSON 序列化/反序列化
   * 主要用于 HTTP 代理转发，避免不必要的编解码开销
   * 
   * @param command - API 命令路径
   * @param data - 原始数据字符串
   * @param headers - 可选请求头部
   * @returns 原始响应字符串
   */
  sendRaw(command: string, data: string, headers?: Map<string, string>): Promise<string>;
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
            proxyHeaders.set(key, value);
          }

          // 使用 sendRaw 方法直接转发原始数据，不进行 JSON 编解码
          const result = await this.client.sendRaw(
            'API/Proxy', 
            this.content_ || '', 
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
