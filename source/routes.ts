import { Route, Method, RouteResult, RouteManager } from './interfaces';

function isNotEmpty<T>(array: T[]) {
  return array.length > 0;
}

export function getRoutesPaths(routes: Route[]) {
  return routes.map(({ path }) => path);
}

export function getRouteMethodsTypes(route: Route) {
  return filterMethodsWithOverrides(route.methods).map(({ type }) =>
    type.toUpperCase()
  );
}

function filterMethodsWithOverrides(methods: Method[]) {
  return methods.filter(({ overrides }) => overrides && isNotEmpty(overrides));
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

export function createRouteManager(): RouteManager {
  let allRoutes: Array<RouteResult> = [];

  return {
    getAll() {
      return allRoutes;
    },

    getWithOverrides() {
      return allRoutes.filter(({ methods }) =>
        isNotEmpty(filterMethodsWithOverrides(methods))
      );
    },

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
