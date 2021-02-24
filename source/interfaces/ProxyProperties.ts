import { ProxyRequestHandler } from '../types';

export default interface ProxyProperties {
  name: string;
  host: string;
  appendBasePath?: boolean;
  onProxyReq?: ProxyRequestHandler;
}
