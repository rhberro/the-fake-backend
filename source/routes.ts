import { Route, Method, RouteResult, RouteManager } from './interfaces';

export function getRoutesPaths(routes: Route[]) {
  return routes.map(({ path }) => path);
}

export function formatMethodType(methodType: string) {
  return methodType.toUpperCase();
}

export function findRouteByUrl(routes: Route[], url: string): RouteResult {
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

/**
 * Create a new route manager.
 *
 * @return The route manager
 */
export function createRouteManager(): RouteManager {
  let allRoutes: Array<RouteResult> = [];

  return {
    /**
     * Get all routes.
     *
     * @return An array containing all the routes
     */
    getAll() {
      return allRoutes;
    },

    /**
     * Set all the routes.
     *
     * @param routes The routes
     */
    setAll(routes) {
      while (allRoutes.length > 0) {
        allRoutes.pop();
      }

      routes.forEach((route) => {
        allRoutes.push(route);
      });
    },
  };
}
