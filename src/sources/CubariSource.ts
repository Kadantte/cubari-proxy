import { SourceInfo } from "paperback-extensions-common";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { Constructor } from "./types";
import { PROXY_URL, base64UrlEncode } from "./SourceUtils";

const UNSAFE_HEADERS = new Set(["cookie", "user-agent", "referer"]);

const requestInterceptor = (req: AxiosRequestConfig) => {
  if (!("retried" in req)) {
    req.url = `${PROXY_URL}/v1/cors/${base64UrlEncode(
      req.url + (req.params ?? "")
    )}?source=proxy_cubari_moe`;
  }
  Object.keys(req.headers).forEach((header) => {
    if (UNSAFE_HEADERS.has(header.toLowerCase())) {
      delete req.headers[header];
    }
  });
  return req;
};

const responseInterceptor = (res: AxiosResponse) => {
  return res;
};

const retryInterceptor = (error: any) => {
  if (!error.config.retried) {
    error.config.url = error.config.url.replace(
      `${PROXY_URL}/v1/cors`,
      `${PROXY_URL}/v2/cors`
    );
    error.config.retried = true;
    return axios.request(error.config);
  }
  return Promise.reject(error);
};

// Interceptors to preserve the requestManager within each source. Thanks Paper!
axios.interceptors.request.use(requestInterceptor);
axios.interceptors.response.use(responseInterceptor, retryInterceptor);

export function CubariSourceMixin<TBase extends Constructor>(
  Base: TBase,
  sourceInfo: SourceInfo,
  getMangaUrlCallback: (slug: string) => string
) {
  return class CubariSource extends Base {
    getMangaUrl = getMangaUrlCallback;

    getSourceDetails = () => {
      return sourceInfo;
    };

    requestManager = App.createRequestManager({
      requestsPerSecond: 5,
      requestTimeout: 20000,
      interceptor: {
        interceptRequest: async (request) => {
          
          // extension lib will still attempt to set forbidden headers, 
          // we can override that fn as well but browsers already attempt to block this
          request.headers = {}
          request.url = `${PROXY_URL}/v1/cors/${base64UrlEncode(
            request.url + (request.param ?? "")
          )}?source=proxy_cubari_moe`;
          return request;
        },
        interceptResponse: async (response) => {
          return response;
        },
      },
    });
  };
}
