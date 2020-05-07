import {
  Method,
  MethodOverride,
  OverrideOptions,
  Route,
  OverrideManager,
  OverrideSelectResult,
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
  getRouteMethodsTypes,
} from './routes';

const OVERRIDE_DEFAULT_OPTION = 'Default';

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

export function findSelectedMethodOverride(method: Method) {
  return method.overrides?.find(({ selected }) => selected);
}

/**
 * Create a new override manager.
 *
 * @return The override manager
 */
export function createOverrideManager(
  options: OverrideOptions
): OverrideManager {
  return {
    /**
     * Get the selected route method overrides.
     *
     * @return An array containing all the selected overrides.
     */
    getSelected() {
      return options.routeManager
        .getAll()
        .reduce<OverrideSelectResult[]>((acc, route) => {
          route.methods.forEach((method) => {
            const selectedOverride = findSelectedMethodOverride(method);

            if (selectedOverride) {
              acc.push({ route, method, name: selectedOverride.name });
            }
          });

          return acc;
        }, []);
    },

    /**
     * Prompt and select a route method override.
     */
    async choose() {
      const routes = options.routeManager.getWithOverrides();
      const { url } = await promptRoutePath(getRoutesPaths(routes));
      const route = findRouteByUrl(routes, url);
      const { type } = await promptRouteMethodType(getRouteMethodsTypes(route));
      const overrides = getMethodOverridesByType(route, type);
      const { name } = await promptRouteMethodOverride(
        getOverridesNamesWithDefault(overrides)
      );

      const method = findRouteMethodByType(route.methods, type);

      method.overrides?.forEach((override) => {
        override.selected = override.name === name;
      });

      return { route, method, name };
    },
  };
}
