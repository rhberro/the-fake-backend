import { prop, propEq } from 'ramda';
import { match } from 'path-to-regexp';
import { MethodType } from './enums';
import { readFixtureSync } from './files';
import htmlSummary from './html-summary';
import {
  Route,
  Method,
  MethodOverride,
  Request,
  ServerOptions,
} from './interfaces';
import { MethodAttribute, Middleware } from './types';

export function getRoutesPaths(routes: Route[]) {
  return routes.map(prop('path'));
}

export function formatMethodType(methodType: string) {
  return methodType.toUpperCase();
}

export function findRouteByUrl(routes: Route[], url: string): Route {
  const route = routes.find(({ path }) => {
    const routeMatch = match(path);

    return routeMatch(url);
  });

  if (route) {
    return route;
  }

  throw new Error(`Route with url "${url}" not found`);
}

export function findRouteMethodByType(methods: Method[], methodType: string) {
  const method = methods.find(propEq('type', methodType.toLowerCase()));

  if (method) {
    return method;
  }

  throw new Error(`Method with type "${methodType}" not found`);
}

/**
 * Resolve the attribute by applying request argument if it is a function.
 *
 * @param attribute The attribute
 * @param req The request object
 * @return The resolved attribute
 */
export function resolveMethodAttribute(
  attribute: MethodAttribute<any>,
  req: Request
) {
  return typeof attribute === 'function' ? attribute(req) : attribute;
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

function normalizeReqPath(options: ServerOptions, req: Request) {
  return req.path.replace(options.basePath || '', '');
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
   * Find a route by path.
   *
   * @param path Route path
   */
  private findRouteByPath(path: string) {
    return findRouteByUrl(this.routes, path);
  }

  /**
   * Find a route by path and method.
   *
   * @param path Route path
   * @param method Route method
   */
  private findRouteMethod(path: string, method: string) {
    const route = this.findRouteByPath(path);

    return findRouteMethodByType(route.methods, method);
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

  /**
   * Create a middleware that resolves the route given a request.
   *
   * @param options Server options
   */
  createResolvedRouteMiddleware(options: ServerOptions): Middleware {
    return (req, res, next) => {
      const { method } = req;
      const normalizedReqPath = normalizeReqPath(options, req);

      try {
        const route = this.findRouteByPath(normalizedReqPath);
        const routeMethod = findRouteMethodByType(route.methods, method);

        res.locals.route = route;
        res.locals.routeMethod = routeMethod;
      } catch (e) {
        return res.status(404).send('Not found');
      }

      next();
    };
  }

  /**
   * Create a middleware that resolves the route method response.
   */
  createRouteMethodResponseMiddleware(options: ServerOptions): Middleware {
    return (req, res, next) => {
      const { route, routeMethod } = res.locals;
      const data = resolveMethodAttribute(routeMethod.data, req);
      const file = resolveMethodAttribute(routeMethod.file, req);
      const normalizedReqPath = normalizeReqPath(options, req);
      const content =
        data ||
        readFixtureSync(
          file || normalizedReqPath,
          route.path,
          routeMethod.scenario
        );

      res.locals.response = content;

      next();
    };
  }
}
