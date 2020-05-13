import { Method, Route } from './interfaces';

export function getRoutesPaths(routes: Route[]) {
  return routes.map(({ path }) => path);
}

export function formatMethodType(methodType: string) {
  return methodType.toUpperCase();
}

export function findRouteByUrl(routes: Route[], url: string): Route {
  const route = routes.find(({ path }) => path === url);

  if (route) {
    return route;
  }

  throw new Error(`Route with url "${url}" not found`);
}

export function findRouteMethodByType(methods: Method[], type: string) {
  const method = methods.find((method) => method.type === type);

  if (method) {
    return method;
  }

  throw new Error(`Method with type "${type}" not found`);
}

export class RouteManager {
  private routes: Route[];

  /**
   * Create a new route manager.
   */
  constructor() {
    this.routes = [];
  }

  /**
   * Get all routes.
   *
   * @return An array containing all the routes
   */
  getAll() {
    return this.routes;
  }

  /**
   * Set all the routes.
   *
   * @param routes The routes
   */
  setAll(routes: Route[]) {
    while (this.routes.length > 0) {
      this.routes.pop();
    }

    routes.forEach((route) => {
      this.routes.push(route);
    });
  }
}
