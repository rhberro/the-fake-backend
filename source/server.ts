import { Method, Route, Server, ServerOptions } from './interfaces';
import cors from 'cors';
import { createInputManager } from './input';
import createPaginatedResponse from './response/paginated';
import { createProxyManager } from './proxy';
import createSearchableResponse from './response/searchable';
import { createThrottlingManager } from './throttling';
import { createUIManager } from './ui';
import express from 'express';
import { readFixtureSync } from './files';
import { overridesListener } from './overridesListener';

export function createServer(options: ServerOptions): Server {
  const { middlewares, proxies, throttlings } = options || {};

  const proxyManager = createProxyManager(proxies);
  const throttlingManager = createThrottlingManager(throttlings);
  const uiManager = createUIManager(proxyManager, throttlingManager);

  const expressServer = express();
  const allRoutes: Array<Route> = [];

  expressServer.use(middlewares || cors());
  expressServer.use(
    (req: express.Request, res: express.Response, next: Function) =>
      uiManager.drawRequest(req, res, next)
  );

  /**
   * Merge method with current override selected.
   * @param method The method object.
   */
  function parseMethod(method: Method) {
    if (method.overrides) {
      const overrideSelected = method.overrides.find(
        ({ selected }) => selected
      );

      if (overrideSelected) {
        return {
          ...method,
          ...overrideSelected,
        };
      }
    }

    return method;
  }

  /**
   * Create the method response object.
   *
   * @param {Method} method The method object.
   * @param {express.Request} req The request object.
   * @param {express.Respose} res The response object.
   */
  function createMethodResponse(
    method: Method,
    req: express.Request,
    res: express.Response
  ): void {
    const { code = 200, data, file, paginated, search } = parseMethod(method);
    const { path } = req;

    const proxy = proxyManager.getCurrent();

    if (proxy) {
      return proxy.proxy(req, res);
    }

    let content = data || readFixtureSync(file || path);

    if (search) {
      content = createSearchableResponse(req, res, content, method);
    }

    if (paginated) {
      content = createPaginatedResponse(req, res, content, options);
    }

    function sendContent() {
      res.status(code).send(content);
    }

    setTimeout(sendContent, throttlingManager.getCurrentDelay());
  }

  /**
   * Create a new route's method.
   *
   * @param {Route} route The route object.
   * @param {Method} method The method object.
   */
  function createMethod(route: Route, method: Method): void {
    const { path } = route;
    const { type } = method;

    const response = createMethodResponse.bind(null, method);

    expressServer[type](path, response);
  }

  /**
   * Create a new route.
   *
   * @param {Route} route The route object.
   */
  function createRoute(route: Route): void {
    const { methods } = route;

    const createRouteMethod = createMethod.bind(null, route);

    methods.map(createRouteMethod);
  }

  /**
   * Setter for `allRoutes`.
   * @param routes Routes to set.
   */
  function setAllRoutes(routes: Array<Route>) {
    while (allRoutes.length > 0) {
      allRoutes.pop();
    }

    routes.forEach((route) => {
      allRoutes.push(route);
    });
  }

  /**
   * Sets the current override methods selected.
   * @param routePath The route path that will be updated.
   * @param routeMethodType The route method type that will be updated.
   * @param overrideNameSelected The override name selected.
   */
  function selectMethodOverride(
    routePath: string,
    routeMethodType: string,
    overrideNameSelected?: string
  ) {
    const route = allRoutes.find(({ path }) => path === routePath);
    const routeMethod = route?.methods.find(
      ({ type }) => type === routeMethodType
    );

    routeMethod?.overrides?.forEach((override) => {
      override.selected = override.name === overrideNameSelected;
    });

    uiManager.writeEndpointChanged(
      routePath,
      routeMethodType,
      overrideNameSelected
    );
  }

  return {
    /**
     * Register the server routes.
     *
     * @param {Array<Route>} routes The server routes.
     */
    routes(routes: Array<Route>): void {
      setAllRoutes(routes);
      routes.map(createRoute);
    },

    /**
     * Start listening on port.
     *
     * @param {number} port The server port.
     */
    listen(port: number = 8080): void {
      const inputManager = createInputManager();

      inputManager.init(true);

      uiManager.drawDashboard();

      function onThrottling() {
        throttlingManager.toggleCurrent();
        uiManager.drawDashboard();
      }

      function onConnection() {
        proxyManager.toggleCurrent();
        uiManager.drawDashboard();
      }

      inputManager.addListener('c', onConnection);
      inputManager.addListener('t', onThrottling);
      inputManager.addListener(
        'o',
        overridesListener({
          getAllRoutes: () => allRoutes,
          selectMethodOverride,
        })
      );

      expressServer.listen(port);
    },
  };
}
