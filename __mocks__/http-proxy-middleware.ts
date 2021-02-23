import { Options } from 'http-proxy-middleware';

export const createProxyMiddleware = (proxy: Options) =>
  jest.fn((_req, _res, next) => next(proxy.target));
