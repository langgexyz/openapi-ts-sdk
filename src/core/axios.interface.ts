/**
 * Axios 接口定义，避免直接依赖 axios 包
 */

export interface AxiosRequestConfig {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: any;
  timeout?: number;
  baseURL?: string;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

export interface AxiosError {
  message: string;
  response?: AxiosResponse;
  config?: AxiosRequestConfig;
  code?: string;
}

/**
 * HTTP 请求器接口 - 只需要一个通用的 request 方法
 */
export interface HttpRequester {
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
