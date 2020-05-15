import { Route, Method, MethodOverride, RouteProperties } from './interfaces';

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

function cloneOverrides(overrides: MethodOverride[]) {
  return overrides.map((override) => ({
    ...override,
    name: `${override.name} (Global)`,
  }));
}

function mergeMethodWithGlobalOverrides(globalOverrides: MethodOverride[]) {
  return function (method: Method) {
    const methodOverrides = method.overrides || [];
    const overrides = [...methodOverrides, ...cloneOverrides(globalOverrides)];

    return {
      ...method,
      overrides,
    };
  };
}

function mergeRoutesWithGlobalOverrides(
  routes: Route[],
  globalOverrides: MethodOverride[] = []
) {
  if (globalOverrides.length) {
    return routes.map((route) => {
      const methods = route.methods.map(
        mergeMethodWithGlobalOverrides(globalOverrides)
      );

      return {
        ...route,
        methods,
      };
    });
  }

  return routes;
}

function getNumberOfParameter(path: string) {
  return (path.match(/:/g) ?? []).length;
}

function sortRoutesByNumberOfParameters(routes: RouteProperties[]) {
  return routes.sort((routeA, routeB) => {
    return (
      getNumberOfParameter(routeA.path) - getNumberOfParameter(routeB.path)
    );
  });
}

export class RouteManager {
  private routes: Route[];
  private globalOverrides?: MethodOverride[];

  /**
   * Create a new route manager.
   */
  constructor(globalOverrides: MethodOverride[] = []) {
    this.globalOverrides = globalOverrides;
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
    const routesWithOverrides = mergeRoutesWithGlobalOverrides(
      routes,
      this.globalOverrides
    );
    const routesSorted = sortRoutesByNumberOfParameters(routesWithOverrides);

    while (this.routes.length > 0) {
      this.routes.pop();
    }

    routesSorted.forEach((route) => {
      this.routes.push(route);
    });
  }
}
