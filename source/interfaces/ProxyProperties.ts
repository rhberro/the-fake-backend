import { ProxyRequestHandler, ProxyResponseHandler } from '../types';

export default interface ProxyProperties {
  name: string;
  host: string;
  appendBasePath?: boolean;
  onProxyReq?: ProxyRequestHandler;
  onProxyRes?: ProxyResponseHandler;
}
