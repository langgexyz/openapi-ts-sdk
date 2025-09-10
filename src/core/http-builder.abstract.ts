import { Http, HttpMethod } from './http.interface';

/**
 * HTTP 构建器抽象类
 */
export abstract class HttpBuilder {
  protected baseUrl_ = "";
  protected uri_ = "";
  protected headers_: Map<string, string> = new Map();
  protected content_: string = "";
  protected pusher_: (data: string) => void = () => {};
  protected method_: HttpMethod = HttpMethod.POST;

  constructor(url: string) {
    this.baseUrl_ = url;
  }

  /**
   * 设置请求内容
   * @param content 请求体内容
   */
  public setContent(content: string): this {
    this.content_ = content;
    return this;
  }

  /**
   * 获取请求内容
   */
  public content(): string {
    return this.content_;
  }

  /**
   * 设置数据推送器
   * @param pusher 数据推送回调函数
   */
  public setPusher(pusher: (data: string) => void): this {
    this.pusher_ = pusher;
    return this;
  }

  /**
   * 获取数据推送器
   */
  public pusher(): (data: string) => void {
    return this.pusher_;
  }

  /**
   * 获取基础 URL
   */
  public baseUrl(): string {
    return this.baseUrl_;
  }

  /**
   * 设置请求路径
   * @param uri 请求路径
   */
  public setUri(uri: string): this {
    this.uri_ = uri;
    return this;
  }

  /**
   * 获取请求路径
   */
  public uri(): string {
    return this.uri_;
  }

  /**
   * 设置 HTTP 方法
   * @param method HTTP 请求方法
   */
  public setMethod(method: HttpMethod): this {
    this.method_ = method;
    return this;
  }

  /**
   * 获取 HTTP 方法
   */
  public method(): HttpMethod {
    return this.method_;
  }

  /**
   * 设置请求头集合
   * @param headers 请求头映射
   */
  public setHeaders(headers: Map<string, string>): this {
    this.headers_ = headers;
    return this;
  }

  /**
   * 添加单个请求头
   * @param key 请求头名称
   * @param value 请求头值
   */
  public addHeader(key: string, value: string): this {
    this.headers_.set(key, value);
    return this;
  }

  /**
   * 获取请求头集合
   */
  public headers(): Map<string, string> {
    return this.headers_;
  }

  /**
   * 构建 HTTP 实例
   */
  public abstract build(): Http;
}
