import cors from 'cors';
import express from 'express';

import { InputManager } from './input';
import {
  Method,
  Server,
  ServerOptions,
  Route,
  Request,
  Response,
} from './interfaces';
import { OverrideManager } from './overrides';
import { ProxyManager } from './proxy';
import createPaginatedRouteMiddleware from './response/paginated';
import createSearchableRouteMiddleware from './response/searchable';
import { resolveMethodAttribute, RouteManager } from './routes';
import { ThrottlingManager } from './throttling';
import { UIManager } from './ui';
import { GraphQLManager } from './graphql';
import { join } from 'path';
import { FileStorage } from './storage';

export function createServer(options = {} as ServerOptions): Server {
  const {
    basePath = '',
    docsRoute = '',
    definitions,
    middlewares,
    overrides,
    proxies,
    throttlings,
    fileStorageOptions,
  } = options;

  const fileStorage = new FileStorage(fileStorageOptions);
  const routeManager = new RouteManager(overrides);
  const overrideManager = new OverrideManager(routeManager, fileStorage);
  const proxyManager = new ProxyManager(routeManager, proxies, basePath);
  const throttlingManager = new ThrottlingManager(throttlings);
  const uiManager = new UIManager(
    proxyManager,
    throttlingManager,
    overrideManager,
    fileStorage
  );

  const expressServer: express.Application = express();

  if (definitions) {
    const graphqlManager = new GraphQLManager(definitions);
    graphqlManager.applyMiddlewareTo(expressServer);
  }

  expressServer.use(middlewares || cors());

  expressServer.use(
    uiManager.createDrawRequestMiddleware(),
    routeManager.createResolvedRouteMiddleware(options),
    proxyManager.createRouteMiddleware(),
    overrideManager.createOverriddenRouteMethodMiddleware(),
    throttlingManager.createMiddleware(),
    proxyManager.createGlobalMiddleware()
  );

  /**
   * Create the method response object.
   *
   * @param req The request object
   * @param res The response object
   */
  function createRouteMethodResponse(req: Request, res: Response): void {
    const { response, routeMethod } = res.locals;
    const { code = 200 } = routeMethod;

    const headers = resolveMethodAttribute(routeMethod.headers, req);

    res.set(headers).status(code);

    if (Number.isInteger(response)) {
      res.send(response.toString());
    } else {
      res.send(response);
    }
  }

  /**
   * Create a new route's method.
   *
   * @param route The route object
   * @param method The method object
   */
  function createRouteMethod(route: Route, method: Method): void {
    const { path } = route;
    const { type } = method;

    expressServer[type](
      join(basePath, path),
      routeManager.createRouteMethodResponseMiddleware(options),
      createSearchableRouteMiddleware(),
      createPaginatedRouteMiddleware(options),
      overrideManager.createOverriddenRouteContentMiddleware(),
      createRouteMethodResponse
    );
  }

  /**
   * Create a new route.
   *
   * @param route The route object
   */
  function createRoute(route: Route): void {
    const { methods } = route;

    methods.forEach((method) => createRouteMethod(route, method));
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
      overrideManager.applyExternalOverrides();
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

      async function onResetFileStorage() {
        fileStorage.clear();
        uiManager.drawDashboard();
      }

      inputManager.addListener('c', onConnection);
      inputManager.addListener('t', onThrottling);
      inputManager.addListener('o', onOverride);
      inputManager.addListener('p', onRouteProxy);

      if (fileStorage.options.enabled) {
        inputManager.addListener('x', onResetFileStorage);
      }

      expressServer.listen(port);
    },
  };
}
