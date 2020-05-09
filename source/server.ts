import cors from 'cors';
import express from 'express';

import {
  Method,
  Route,
  Server,
  ServerOptions,
  RouteResult,
} from './interfaces';
import { createInputManager } from './input';
import createPaginatedResponse from './response/paginated';
import { createProxyManager } from './proxy';
import createSearchableResponse from './response/searchable';
import { createThrottlingManager } from './throttling';
import { createUIManager } from './ui';
import { findSelectedMethodOverride, createOverrideManager } from './overrides';
import { readFixtureSync } from './files';
import { ResponseHeaders, MethodAttribute } from './types';
import { createRouteManager } from './routes';
import { reduceEachTrailingCommentRange } from 'typescript';

function isSuccessfulStatusCode(code: number) {
  return code >= 200 && code <= 299;
}

export function createServer(options = {} as ServerOptions): Server {
  const { middlewares, proxies, throttlings } = options;

  const routeManager = createRouteManager({
    globalOverrides: options.overrides,
  });
  const overrideManager = createOverrideManager({ routeManager });
  const proxyManager = createProxyManager(proxies, { routeManager });
  const throttlingManager = createThrottlingManager(throttlings);
  const uiManager = createUIManager(
    proxyManager,
    throttlingManager,
    overrideManager
  );

  const expressServer = express();

  expressServer.use(middlewares || cors());
  expressServer.use(
    (req: express.Request, res: express.Response, next: Function) =>
      uiManager.drawRequest(req, res, next)
  );

  /**
   * Merge method with current selected override.
   *
   * @param method The method object
   * @return The parsed method
   */
  function parseMethod(method: Method): Method {
    if (method.overrides) {
      const selectedOverride = findSelectedMethodOverride(method);

      if (selectedOverride) {
        return {
          ...method,
          ...selectedOverride,
        };
      }
    }

    return method;
  }

  /**
   * Resolve the attribute by applying request argument if it is a function.
   *
   * @param attribute The attribute
   * @param req The request object
   * @return The resolved attribute
   */
  function resolveMethodAttribute(
    attribute: MethodAttribute<any>,
    req: express.Request
  ) {
    return typeof attribute === 'function' ? attribute(req) : attribute;
  }

  /**
   * Get the route current proxy.
   *
   * @param route The route
   * @return Current proxy
   */
  function getProxy(route: RouteResult) {
    if (route.proxy !== undefined) {
      return route.proxy;
    }

    return proxyManager.getCurrent();
  }

  /**
   * Get the method content.
   *
   * @param method The method object
   * @param routePath The route path
   * @param req The request object
   * @param res The response object
   * @return The method content
   */
  function getContent(
    method: Method,
    routePath: string,
    req: express.Request,
    res: express.Response
  ): any {
    const { overrideContent, pagination, search } = method;
    const { path } = req;

    const data = resolveMethodAttribute(method.data, req);
    const file = resolveMethodAttribute(method.file, req);
    let content = data || readFixtureSync(file || path, routePath);

    if (search) {
      content = createSearchableResponse(req, res, content, method);
    }

    if (pagination) {
      content = createPaginatedResponse(req, res, content, method, options);
    }

    if (overrideContent) {
      content = overrideContent(req, content);
    }

    return content;
  }

  /**
   * Response the url with the content.
   *
   * @param res The response object
   * @param code The response code
   * @param content The response content
   * @param headers The response headers
   * @param delay The response delay
   */
  function sendContent(
    res: express.Response,
    code: number,
    content: any,
    headers: ResponseHeaders = {},
    delay?: number
  ) {
    setTimeout(
      () => res.status(code).set(headers).send(content),
      delay || throttlingManager.getCurrentDelay()
    );
  }

  /**
   * Create the method response object.
   *
   * @param method The method object
   * @param req The request object
   * @param res The response object
   */
  function createMethodResponse(
    method: Method,
    route: RouteResult,
    req: express.Request,
    res: express.Response
  ): void {
    const parsedMethod = parseMethod(method);
    const { code = 200 } = parsedMethod;
    const proxy = getProxy(route);

    if (proxy) {
      return proxy.proxy(req, res);
    }

    if (isSuccessfulStatusCode(code)) {
      const content = getContent(parsedMethod, route.path, req, res);
      const headers = resolveMethodAttribute(parsedMethod.headers, req);

      sendContent(res, code, content, headers, parsedMethod.delay);
    } else {
      sendContent(res, code, null);
    }
  }

  /**
   * Create a new route's method.
   *
   * @param route The route object
   * @param method The method object
   */
  function createMethod(route: RouteResult, method: Method): void {
    const { path } = route;
    const { type } = method;

    const response = createMethodResponse.bind(null, method, route);

    expressServer[type](path, response);
  }

  /**
   * Create a new route.
   *
   * @param route The route object
   */
  function createRoute(route: Route): void {
    const { methods } = route;

    const createRouteMethod = createMethod.bind(null, route);

    methods.map(createRouteMethod);
  }

  return {
    /**
     * Register the server routes.
     *
     * @param routes The server routes
     */
    routes(routes): void {
      routeManager.setAll(routes);
      routes.map(createRoute);
    },

    /**
     * Start listening on port.
     *
     * @param port The server port
     */
    listen(port = 8080): void {
      const inputManager = createInputManager();

      inputManager.init(true);

      uiManager.drawDashboard();

      function onConnection() {
        proxyManager.toggleCurrent();
        uiManager.drawDashboard();
      }

      function onThrottling() {
        throttlingManager.toggleCurrent();
        uiManager.drawDashboard();
      }

      async function onOverride() {
        const { routePath, methodType, name } = await overrideManager.choose();

        uiManager.drawDashboard();
        uiManager.writeMethodOverrideChanged(routePath, methodType, name);
      }

      async function onRouteProxy() {
        const route = await proxyManager.chooseRouteProxy();

        uiManager.drawDashboard();
        uiManager.writeRouteProxyChanged(
          route.path,
          route.proxy?.name || 'Local'
        );
      }

      inputManager.addListener('c', onConnection);
      inputManager.addListener('t', onThrottling);
      inputManager.addListener('o', onOverride);
      inputManager.addListener('p', onRouteProxy);

      expressServer.listen(port);
    },
  };
}
