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
export declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS"
}
/**
 * HTTP 构建器抽象类
 */
export declare abstract class HttpBuilder {
    protected baseUrl_: string;
    protected uri_: string;
    protected headers_: Map<string, string>;
    protected content_: string;
    protected pusher_: (data: string) => void;
    protected method_: HttpMethod;
    constructor(url: string);
    /**
     * 设置请求内容
     * @param content 请求体内容
     */
    setContent(content: string): this;
    /**
     * 获取请求内容
     */
    content(): string;
    /**
     * 设置数据推送器
     * @param pusher 数据推送回调函数
     */
    setPusher(pusher: (data: string) => void): this;
    /**
     * 获取数据推送器
     */
    pusher(): (data: string) => void;
    /**
     * 获取基础 URL
     */
    baseUrl(): string;
    /**
     * 设置请求路径
     * @param uri 请求路径
     */
    setUri(uri: string): this;
    /**
     * 获取请求路径
     */
    uri(): string;
    /**
     * 设置 HTTP 方法
     * @param method HTTP 请求方法
     */
    setMethod(method: HttpMethod): this;
    /**
     * 获取 HTTP 方法
     */
    method(): HttpMethod;
    /**
     * 设置请求头集合
     * @param headers 请求头映射
     */
    setHeaders(headers: Map<string, string>): this;
    /**
     * 添加单个请求头
     * @param key 请求头名称
     * @param value 请求头值
     */
    addHeader(key: string, value: string): this;
    /**
     * 获取请求头集合
     */
    headers(): Map<string, string>;
    /**
     * 构建 HTTP 实例
     */
    abstract build(): Http;
}
//# sourceMappingURL=http-builder.abstract.d.ts.map