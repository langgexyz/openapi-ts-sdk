/**
 * HTTP 请求接口
 */
export interface Http {
  /**
   * 发送 HTTP 请求
   * @returns Promise<[response: string, error: Error | null]>
   */
  send(): Promise<[string, Error | null]>;
}

/**
 * HTTP 方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}
