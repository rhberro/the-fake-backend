import cors from 'cors';
import express from 'express';

import { readFixtureSync } from './files';
import { InputManager } from './input';
import {
  Method,
  Server,
  ServerOptions,
  Route,
  Request,
  Response,
} from './interfaces';
import { findSelectedMethodOverride, OverrideManager } from './overrides';
import { ProxyManager } from './proxy';
import createPaginatedResponse from './response/paginated';
import createSearchableResponse from './response/searchable';
import { RouteManager } from './routes';
import { ThrottlingManager } from './throttling';
import { ResponseHeaders, MethodAttribute } from './types';
import { UIManager } from './ui';
import { GraphQLManager } from './graphql';

export function createServer(options = {} as ServerOptions): Server {
  const {
    basePath = '',
    docsRoute = '',
    definitions,
    middlewares,
    overrides,
    proxies,
    throttlings,
  } = options;

  const routeManager = new RouteManager(overrides);
  const overrideManager = new OverrideManager(routeManager);
  const proxyManager = new ProxyManager(routeManager, proxies, basePath);
  const throttlingManager = new ThrottlingManager(throttlings);
  const uiManager = new UIManager(
    proxyManager,
    throttlingManager,
    overrideManager
  );

  const expressServer: express.Application = express();

  if (definitions) {
    const graphqlManager = new GraphQLManager(definitions);
    graphqlManager.applyMiddlewareTo(expressServer);
  }

  expressServer.use(middlewares || cors());
  expressServer.use((req: Request, res: Response, next: Function) =>
    uiManager.drawRequest(req, res, next)
  );

  expressServer.use((req: Request, res, next) => {
    const route = routeManager.findRouteByPath(req.path.replace(basePath, ''));
    if (route) {
      const proxy = proxyManager.resolveRouteProxy(route);
      if (proxy) {
        return proxy?.(req, res, next);
      }
    }

    next();
  });

  /**
   * Merge method with current selected override.
   *
   * @param method The method object
   * @return The parsed method
   */
  function mergeMethodWithSelectedOverride(method: Method): Method {
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
    req: Request
  ) {
    return typeof attribute === 'function' ? attribute(req) : attribute;
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
    req: Request,
    res: Response
  ): any {
    const { overrideContent, pagination, search } = method;
    const { path } = req;
    const normalizedReqPath = path?.replace(basePath, '');

    const data = resolveMethodAttribute(method.data, req);
    const file = resolveMethodAttribute(method.file, req);
    let content =
      data ||
      readFixtureSync(file || normalizedReqPath, routePath, method.scenario);

    if (search) {
      content = createSearchableResponse(req, res, content, method);
    }

    if (pagination) {
      content = createPaginatedResponse(req, res, content, method, options);
    }

    if (overrideContent) {
      content = overrideContent(req, content);
    }

    if (Number.isInteger(data)) {
      content = content.toString();
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
    res: Response,
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
    route: Route,
    req: Request,
    res: Response
  ): void {
    const mergedMethod = mergeMethodWithSelectedOverride(method);
    const { code = 200 } = mergedMethod;

    const content = getContent(mergedMethod, route.path, req, res);
    const headers = resolveMethodAttribute(mergedMethod.headers, req);

    sendContent(res, code, content, headers, mergedMethod.delay);
  }

  /**
   * Create a new route's method.
   *
   * @param route The route object
   * @param method The method object
   */
  function createMethod(route: Route, method: Method): void {
    const { path } = route;
    const { type } = method;

    const response = createMethodResponse.bind(null, method, route);

    expressServer[type](`${basePath}${path}`, response);
  }

  /**
   * Create a new route.
   *
   * @param route The route object
   */
  function createRoute(route: Route): void {
    const { methods } = route;

    const createRouteMethod = createMethod.bind(null, route);

    methods.forEach(createRouteMethod);
  }

  return {
    /**
     * Register the server routes.
     *
     * @param routes The server routes
     */
    routes(routes): void {
      routeManager.setAll(routes);
      routeManager.addDocsRoute(basePath, docsRoute);
      routeManager.getAll().forEach(createRoute);
    },

    /**
     * Start listening on port.
     *
     * @param port The server port
     */
    listen(port = 8080): void {
      const inputManager = new InputManager();

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
        uiManager.drawMethodOverrideChanged(routePath, methodType, name);
      }

      async function onRouteProxy() {
        const route = await proxyManager.chooseRouteProxy();

        uiManager.drawDashboard();
        uiManager.drawRouteProxyChanged(
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
