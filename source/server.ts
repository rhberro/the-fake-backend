import express, { Express } from 'express';

import { Method } from 'interfaces/Method';
import { Route } from 'interfaces/Route';
import { Server } from 'interfaces/Server';

import { createInterface } from './gui';

export function createServer(): Server {
  const expressServer: Express = express();

  function createMethodResponse(
    route: Route,
    method: Method,
    req: express.Request,
    res: express.Response
  ): void {
    const { code = 200 } = method;
    res.status(code).send('Response');
  }

  function createMethod(route: Route, method: Method): void {
    const { path } = route;
    const { type } = method;
    const response = createMethodResponse.bind(null, route, method);
    expressServer[type](path, response);
  }

  function createRoute(route: Route): void {
    const { methods } = route;
    const createRouteMethod = createMethod.bind(null, route);
    methods.map(createRouteMethod);
  }

  return {
    routes(routes: Route[]): void {
      routes.map(createRoute);
    },
    listen(port: number): void {
      expressServer.listen(port);
      createInterface();
    },
  };
};
