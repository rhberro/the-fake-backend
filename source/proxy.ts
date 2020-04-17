import Proxy from './interfaces/Proxy';
import ProxyManager from './interfaces/ProxyManager';
import ProxyProperties from './interfaces/ProxyProperties';
import httpProxyMiddleware from 'http-proxy-middleware';

/**
 * Add a proxy property to the proxy properties
 *
 * @param {ProxyProperties} proxy - The proxy properties object.
 *
 * @return {Proxy} The proxy with the proxy middleware.
 */
function createProxyMiddleware(proxy: ProxyProperties): Proxy {
  const { name, host } = proxy;

  return {
    host,
    name,
    proxy: httpProxyMiddleware({
      target: host,
      changeOrigin: true,
    }),
  };
}

/**
 * Create a new proxy manager.
 *
 * @param {Array<ProxyProperties>} proxies - The current list of proxies.
 *
 * @return {ProxyManager} The proxy manager.
 */
export function createProxyManager(
  proxies: Array<ProxyProperties> = []
): ProxyManager {
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
