(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpBuilder = exports.HttpMethod = void 0;
    /**
     * HTTP 方法枚举
     */
    var HttpMethod;
    (function (HttpMethod) {
        HttpMethod["GET"] = "GET";
        HttpMethod["POST"] = "POST";
        HttpMethod["PUT"] = "PUT";
        HttpMethod["DELETE"] = "DELETE";
        HttpMethod["PATCH"] = "PATCH";
        HttpMethod["HEAD"] = "HEAD";
        HttpMethod["OPTIONS"] = "OPTIONS";
    })(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
    /**
     * HTTP 构建器抽象类
     */
    class HttpBuilder {
        constructor(url) {
            this.baseUrl_ = "";
            this.uri_ = "";
            this.headers_ = new Map();
            this.content_ = "";
            this.pusher_ = () => { };
            this.method_ = HttpMethod.POST;
            this.baseUrl_ = url;
        }
        /**
         * 设置请求内容
         * @param content 请求体内容
         */
        setContent(content) {
            this.content_ = content;
            return this;
        }
        /**
         * 获取请求内容
         */
        content() {
            return this.content_;
        }
        /**
         * 设置数据推送器
         * @param pusher 数据推送回调函数
         */
        setPusher(pusher) {
            this.pusher_ = pusher;
            return this;
        }
        /**
         * 获取数据推送器
         */
        pusher() {
            return this.pusher_;
        }
        /**
         * 获取基础 URL
         */
        baseUrl() {
            return this.baseUrl_;
        }
        /**
         * 设置请求路径
         * @param uri 请求路径
         */
        setUri(uri) {
            this.uri_ = uri;
            return this;
        }
        /**
         * 获取请求路径
         */
        uri() {
            return this.uri_;
        }
        /**
         * 设置 HTTP 方法
         * @param method HTTP 请求方法
         */
        setMethod(method) {
            this.method_ = method;
            return this;
        }
        /**
         * 获取 HTTP 方法
         */
        method() {
            return this.method_;
        }
        /**
         * 设置请求头集合
         * @param headers 请求头映射
         */
        setHeaders(headers) {
            this.headers_ = headers;
            return this;
        }
        /**
         * 添加单个请求头
         * @param key 请求头名称
         * @param value 请求头值
         */
        addHeader(key, value) {
            this.headers_.set(key, value);
            return this;
        }
        /**
         * 获取请求头集合
         */
        headers() {
            return this.headers_;
        }
    }
    exports.HttpBuilder = HttpBuilder;
});
//# sourceMappingURL=http-builder.abstract.js.map