import { HttpBuilder, Http, HttpMethod } from '../core';
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * HTTP 请求器接口 - 只需要一个通用的 request 方法
 */
export interface HttpRequester {
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

/**
 * Axios HTTP Builder 实现
 */
export class AxiosHttpBuilder extends HttpBuilder {
  private httpRequester: HttpRequester;

  constructor(url: string, httpRequester: HttpRequester) {
    super(url);
    this.httpRequester = httpRequester;
  }

  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          const config: AxiosRequestConfig = {
            method: this.method_.toLowerCase() as any,
            url: `${this.baseUrl_}${this.uri_}`,
            headers: Object.fromEntries(this.headers_)
          };

          // 对于 GET 请求，将 JSON 内容作为查询参数
          if (this.method_ === HttpMethod.GET && this.content_) {
            const params = JSON.parse(this.content_);
            // 确保解析的结果是一个对象
            if (typeof params === 'object' && params !== null && !Array.isArray(params)) {
              config.params = params;
            }
          } else if (this.content_) {
            config.data = this.content_;
          }

          const response = await this.httpRequester.request(config);
          
          const responseData = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);

          return [responseData, null];
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Axios request failed';
          const httpError = new Error(errorMessage);
          
          // 添加更多错误信息
          if (error.response) {
            (httpError as any).status = error.response.status;
            (httpError as any).statusText = error.response.statusText;
            (httpError as any).data = error.response.data;
          }
          
          return ['', httpError];
        }
      }
    };
  }
}
