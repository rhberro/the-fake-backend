import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import {
  both,
  complement,
  equals,
  pathSatisfies,
  prop,
  propEq,
  propSatisfies,
} from 'ramda';

import { Proxy, ProxyProperties, Route } from './interfaces';
import { promptRoutePath, promptProxy } from './prompts';
import { getRoutesPaths, findRouteByUrl, RouteManager } from './routes';
import { Middleware } from './types';

const PROXY_DEFAULT_OPTION = 'Local';

/**
 * Add a httpProxy to a proxy properties.
 *
 * @param proxy The proxy properties object
 * @param basePath The server basePath
 * @return The proxy with the proxy middleware
 */
function buildProxy(proxy: ProxyProperties, basePath?: string): Proxy {
  const { appendBasePath, name, host, onProxyReq, onProxyRes } = proxy;

  return {
    host,
    name,
    handler: createProxyMiddleware({
      target: host,
      pathRewrite: (path) =>
        appendBasePath ? path : path.replace(basePath || '', ''),
      changeOrigin: true,
      onProxyReq,
      onProxyRes,
    }),
  };
}

export class ProxyManager {
  private routeManager: RouteManager;
  private currentProxyIndex: number | null;
  private proxies: Proxy[];

  /**
   * Creates a new proxy manager.
   *
   * @param routeManager An instance of route manager
   * @param proxies The proxies properties
   * @param basePath The server basePath
   */
  constructor(
    routeManager: RouteManager,
    proxies: ProxyProperties[] = [],
    basePath?: string
  ) {
    this.routeManager = routeManager;
    this.currentProxyIndex = null;
    this.proxies = proxies.map((proxy) => buildProxy(proxy, basePath));
  }

  /**
   * Get all proxy names.
   */
  private getProxyNames() {
    return this.proxies.map(prop('name'));
  }

  /**
   * Get all proxy names including default one.
   */
  private getAllNamesWithDefault() {
    return [PROXY_DEFAULT_OPTION, ...this.getProxyNames()];
  }

  /**
   * Find a proxy by name.
   *
   * @param name Name
   */
  private findByName(name: string) {
    return this.proxies.find(propEq('name', name));
  }

  /**
   * Resolve the current proxy handler for a given route.
   *
   * @param route The route
   * @return Resolved proxy handler
   */
  private resolveRouteProxyHandler(route: Route): RequestHandler | undefined {
    const current = this.getCurrent();

    if (route.proxy) {
      return route.proxy.handler;
    }

    return current?.handler;
  }

  /**
   * Get all proxies.
   *
   * @return An array containing all the proxies
   */
  getAll() {
    return this.proxies;
  }

  /**
   * Get current proxy.
   *
   * @return The current proxy.
   */
  getCurrent() {
    if (this.currentProxyIndex !== null) {
      return this.proxies[this.currentProxyIndex];
    }

    return null;
  }

  /**
   * Get the routes with overridden proxy.
   *
   * @return Overridden proxy routes
   */
  getOverriddenProxyRoutes() {
    const current = this.getCurrent();

    return this.routeManager
      .getAll()
      .filter(
        both(
          propSatisfies(complement(equals(undefined)), 'proxy'),
          pathSatisfies(complement(equals(current?.name)), ['proxy', 'name'])
        )
      );
  }

  /**
   * Toggle current proxy moving to the next position on list.
   */
  toggleCurrent() {
    if (this.currentProxyIndex === null) {
      this.currentProxyIndex = 0;
    } else if (this.currentProxyIndex === this.proxies.length - 1) {
      this.currentProxyIndex = null;
    } else {
      this.currentProxyIndex += 1;
    }
  }

  /**
   * Prompt and select a route proxy.
   *
   * @return The updated route
   */
  async chooseRouteProxy(): Promise<Route> {
    const routes = getRoutesPaths(this.routeManager.getAll());
    const { url } = await promptRoutePath(routes);
    const { proxy } = await promptProxy(this.getAllNamesWithDefault());

    const route = findRouteByUrl(this.routeManager.getAll(), url);
    route.proxy = this.findByName(proxy) || null;

    return route;
  }

  /**
   * Create a middleware that optionally proxy requests.
   */
  createMiddleware(): Middleware {
    return (req, res, next) => {
      const { route } = res.locals;

      const handler = this.resolveRouteProxyHandler(route);
      if (handler) {
        return handler(req, res, next);
      }

      next();
    };
  }
}
