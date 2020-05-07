import {
  Proxy,
  ProxyManager,
  ProxyProperties,
  ProxyResult,
  ProxyOptions,
} from './interfaces';
import httpProxyMiddleware from 'http-proxy-middleware';
import { selectEndpointUrl, selectProxy } from './prompts';
import { getRoutesPaths, findRouteByUrl } from './routes';

const PROXY_DEFAULT_OPTION = 'Local';

/**
 * Add a proxy property to the proxy properties
 *
 * @param {ProxyProperties} proxy - The proxy properties object.
 *
 * @return {Proxy} The proxy with the proxy middleware.
 */
function createProxyMiddleware(proxy: ProxyProperties): ProxyResult {
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
  proxies: Array<ProxyProperties> = [],
  options: ProxyOptions
): ProxyManager {
  let currentProxyIndex: number | null = null;

  const proxyMiddlewares = proxies.map(createProxyMiddleware);

  function getProxyNames(proxies: Proxy[]) {
    return proxies.map((proxy) => proxy.name);
  }

  function getAllNamesWithDefault() {
    return [PROXY_DEFAULT_OPTION, ...getProxyNames(proxies)];
  }

  function findByName(name: string): ProxyResult | undefined {
    return proxyMiddlewares.find((proxy) => proxy.name === name);
  }

  return {
    /**
     * Get all proxies.
     *
     * @return {Array<Proxy>} An array containing all the proxies.
     */
    getAll() {
      return proxyMiddlewares;
    },

    /**
     * Get current proxy.
     *
     * @return {Proxy} The current proxy.
     */
    getCurrent() {
      if (currentProxyIndex !== null) {
        return proxyMiddlewares[currentProxyIndex];
      }
      return null;
    },

    /**
     * Toggle current proxy moving to the next position on list.
     */
    toggleCurrent() {
      if (currentProxyIndex === null) {
        currentProxyIndex = 0;
      } else if (currentProxyIndex === proxies.length - 1) {
        currentProxyIndex = null;
      } else {
        currentProxyIndex += 1;
      }
    },

    getOverriddenRoutesProxies() {
      const current = this.getCurrent();

      return options.routeManager
        .getAll()
        .filter(
          ({ proxy }) => proxy !== undefined && proxy?.name !== current?.name
        );
    },

    async selectRouteProxy() {
      const routes = getRoutesPaths(options.routeManager.getAll());
      const { url } = await selectEndpointUrl(routes);
      const { proxy } = await selectProxy(getAllNamesWithDefault());

      const route = findRouteByUrl(options.routeManager.getAll(), url);
      route.proxy = findByName(proxy) || null;

      return route;
    },
  };
}
