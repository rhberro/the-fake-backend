import {
  Method,
  MethodOverride,
  Route,
  Override,
  Middleware,
} from './interfaces';
import {
  promptRoutePath,
  promptRouteMethodType,
  promptRouteMethodOverride,
} from './prompts';
import {
  findRouteByUrl,
  getRoutesPaths,
  findRouteMethodByType,
  formatMethodType,
  RouteManager,
} from './routes';

const OVERRIDE_DEFAULT_OPTION = 'Default';

function isNotEmpty<T>(array: T[]) {
  return array.length > 0;
}

function getOverridesNames(overrides: MethodOverride[]) {
  return overrides.map(({ name }) => name);
}

function getOverridesNamesWithDefault(overrides: MethodOverride[]) {
  return [OVERRIDE_DEFAULT_OPTION, ...getOverridesNames(overrides)];
}

function getMethodOverridesByType({ methods }: Route, routeMethodType: string) {
  const method = findRouteMethodByType(methods, routeMethodType);

  const { overrides } = method;

  if (overrides) {
    return overrides;
  }

  throw new Error(`Method with type "${routeMethodType}" has no "overrides"`);
}

function filterOverridableMethods(methods: Method[]) {
  return methods.filter(({ overrides }) => overrides && isNotEmpty(overrides));
}

function getOverridableRoutesMethodsTypesNames(route: Route) {
  return filterOverridableMethods(route.methods).map((method) =>
    formatMethodType(method.type)
  );
}

function findSelectedMethodOverride(method: Method) {
  return method.overrides?.find(({ selected }) => selected);
}

export class OverrideManager {
  private routeManager: RouteManager;

  /**
   * Creates a new override manager.
   *
   * @param routeManager An instance of route manager
   */
  constructor(routeManager: RouteManager) {
    this.routeManager = routeManager;
  }

  /**
   * Get routes with overrides.
   *
   * @return An array containing all the routes with overrides
   */
  getAll() {
    return this.routeManager
      .getAll()
      .filter(({ methods }) => isNotEmpty(filterOverridableMethods(methods)));
  }

  /**
   * Get the selected route method overrides.
   *
   * @return An array containing all the selected overrides.
   */
  getAllSelected(): Override[] {
    return this.routeManager.getAll().reduce<Override[]>((acc, route) => {
      route.methods.forEach((method) => {
        const selectedOverride = findSelectedMethodOverride(method);

        if (selectedOverride) {
          acc.push({
            routePath: route.path,
            methodType: method.type,
            name: selectedOverride.name,
          });
        }
      });

      return acc;
    }, []);
  }

  /**
   * Prompt and select a route method override.
   */
  async choose(): Promise<Override> {
    const overridableRoutes = this.getAll();
    const { url } = await promptRoutePath(getRoutesPaths(overridableRoutes));
    const route = findRouteByUrl(overridableRoutes, url);
    const methodTypes = getOverridableRoutesMethodsTypesNames(route);
    const { type } = await promptRouteMethodType(methodTypes);
    const overrides = getMethodOverridesByType(route, type.toLowerCase());
    const { name } = await promptRouteMethodOverride(
      getOverridesNamesWithDefault(overrides)
    );

    overrides.forEach((override) => {
      override.selected = override.name === name;
    });

    return { routePath: url, methodType: type, name };
  }

  /**
   * Create a middleware that merges a route with the selected override.
   */
  createOverriddenRouteMiddleware(): Middleware {
    return (_req, res, next) => {
      const { routeMethod } = res.locals;
      const selectedOverride = findSelectedMethodOverride(routeMethod);

      if (selectedOverride) {
        res.locals.routeMethod = {
          ...routeMethod,
          ...selectedOverride,
        };
      }

      next();
    };
  }

  /**
   * Create a middleware that applies a given route override content function.
   */
  createOverriddenContentMiddleware(): Middleware {
    return (req, res, next) => {
      const { response, routeMethod } = res.locals;
      const { overrideContent } = routeMethod;

      if (overrideContent) {
        res.locals.response = overrideContent(req, response);
      }

      next();
    };
  }
}
