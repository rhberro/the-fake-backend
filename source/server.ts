import * as cors from 'cors';
import * as express from 'express';

import Method from './interfaces/Method';
import Route from './interfaces/Route';
import Server from './interfaces/Server';
import ServerOptions from './interfaces/ServerOptions';
import { readFixtureSync } from './files';

export function createServer(options?: ServerOptions): Server {
  const { middlewares } = options || {};
  
  const expressServer: express.Application = express();

  expressServer.use(middlewares || cors());

  /**
   * Create the method response object.
   *
   * @param {Method} method The method object.
   * @param {express.Request} req The request object.
   * @param {express.Respose} res The response object.
   */
  function createMethodResponse(method: Method, req: express.Request, res: express.Response) {
    const { code = 200, data, file } = method;
    const { path } = req;

    let content = data || readFixtureSync(file || path);

    return res.status(code).send(content);
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

  return {
    /**
     * Register the server routes.
     *
     * @param {Array<Route>} routes The server routes.
     */
    routes(routes: Array<Route>): void {
      routes.map(createRoute);
    },

    /**
     * Start listening on port.
     *
     * @param {number} port The server port.
     */
    listen(port: number = 8080): void {
      expressServer.listen(port);
    },
  };
}
