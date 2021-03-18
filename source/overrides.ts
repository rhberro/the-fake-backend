import {
  complement,
  either,
  equals,
  isEmpty,
  isNil,
  pipe,
  prop,
  propOr,
  propSatisfies,
} from 'ramda';
import { Method, MethodOverride, Route, Override } from './interfaces';
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
import { Middleware } from './types';

const OVERRIDE_DEFAULT_OPTION = 'Default';

const isNotEmpty = complement(either(isNil, isEmpty));

function getOverridesNames(overrides: MethodOverride[]) {
  return overrides.map(prop('name'));
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
  return methods.filter(propSatisfies(isNotEmpty, 'overrides'));
}

function getOverridableRoutesMethodsTypesNames(route: Route) {
  return filterOverridableMethods(route.methods).map(
    pipe(prop('type'), formatMethodType)
  );
}

function findSelectedMethodOverride(method: Method) {
  return method.overrides?.find(propSatisfies(equals(true), 'selected'));
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
      .filter(
        pipe(propOr([], 'methods'), filterOverridableMethods, isNotEmpty)
      );
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
  createOverriddenRouteMethodMiddleware(): Middleware {
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
  createOverriddenRouteContentMiddleware(): Middleware {
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
