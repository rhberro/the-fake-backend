import { MethodType } from './enums';
import htmlSummary from './html-summary';
import { Route, Method, MethodOverride } from './interfaces';

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
  const method = methods.find((m) => m.type === type);

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

    while (this.routes.length > 0) {
      this.routes.pop();
    }

    routesWithOverrides.forEach((route) => {
      this.routes.push(route);
    });
  }

  /**
   * Add a docs route that print all the routes as HTML.
   *
   * @param basePath Server base path
   * @param path Server docs route path
   */
  addDocsRoute(basePath: string = '', path: string = '') {
    this.routes.push({
      path,
      methods: [
        {
          type: MethodType.GET,
          headers: {
            'Content-Type': 'text/html',
          },
          data: htmlSummary(this.routes, basePath),
        },
      ],
    });
  }
}
