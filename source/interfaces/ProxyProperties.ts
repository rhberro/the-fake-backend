import { ProxyRequestHandler, ProxyResponseHandler } from '../types';
import { Options } from 'http-proxy-middleware';

export default interface ProxyProperties extends Options {
  name: string;
  host: string;
  appendBasePath?: boolean;
  onProxyReq?: ProxyRequestHandler;
  onProxyRes?: ProxyResponseHandler;
}
