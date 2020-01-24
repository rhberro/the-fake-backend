import * as httpProxyMiddleware from 'http-proxy-middleware';

import Proxy from "./interfaces/Proxy";
import ProxyManager from "./interfaces/ProxyManager";
import ProxyProperties from './interfaces/ProxyProperties';

function createProxyMiddleware(proxy: ProxyProperties): Proxy {
  const { name, host } = proxy;

  return {
    host,
    name,
    proxy: httpProxyMiddleware(
      {
        target: host,
        changeOrigin: true,
      }
    ),
  };
}

export function createProxyManager(proxies: Array<ProxyProperties> = []): ProxyManager {
  let currentProxyIndex: number | null = null;

  const proxyMiddlewares = proxies.map(createProxyMiddleware);

  return {
    /**
     * Get all proxies.
     * 
     * @return {Array<Proxy>} An array containing all the proxies.
     */
    getAll(): Array<Proxy> {
      return proxyMiddlewares;
    },

    /**
     * Get current proxy.
     * 
     * @return {Proxy} The current proxy.
     */
    getCurrent(): Proxy | null {
      if (currentProxyIndex !== null) {
        return proxyMiddlewares[currentProxyIndex];
      }
      return null;
    },

    /**
     * Toggle current proxy moving to the next position on list.
     */
    toggleCurrent(): void {
      if (currentProxyIndex === null) {
        currentProxyIndex = 0;
      } else if (currentProxyIndex === proxies.length - 1) {
        currentProxyIndex = null;
      } else {
        currentProxyIndex += 1;
      }
    },
  };
}
