import { HttpBuilder, Http, HttpMethod } from '../core';

/**
 * Fetch HTTP Builder 实现
 */
export class FetchHttpBuilder extends HttpBuilder {
  public build(): Http {
    return {
      send: async (): Promise<[string, Error | null]> => {
        try {
          const headers = Object.fromEntries(this.headers_);
          let url = `${this.baseUrl_}${this.uri_}`;
          
          const options: RequestInit = {
            method: this.method_,
            headers
          };

          // 对于 GET 请求，将内容作为查询参数
          if (this.method_ === HttpMethod.GET && this.content_) {
            try {
              const params = JSON.parse(this.content_);
              const searchParams = new URLSearchParams();
              
              Object.entries(params).forEach(([key, value]) => {
                searchParams.append(key, String(value));
              });
              
              url += `?${searchParams.toString()}`;
            } catch {
              // 如果不是 JSON，忽略内容
            }
          } else if (this.content_ && this.method_ !== HttpMethod.GET) {
            options.body = this.content_;
          }

          const response = await fetch(url, options);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.text();
          
          // 如果有 pusher，推送响应数据
          if (this.pusher_) {
            this.pusher_(data);
          }

          return [data, null];
        } catch (error: any) {
          const httpError = new Error(error.message || 'Fetch request failed');
          
          // 添加更多错误信息
          if (error.name) {
            (httpError as any).name = error.name;
          }
          
          return ['', httpError];
        }
      }
    };
  }
}
