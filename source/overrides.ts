import {
  Method,
  MethodOverride,
  OverrideOptions,
  Route,
  OverrideManager,
  OverrideSelectResult,
} from './interfaces';
import { selectEndpointUrl, selectMethodType, selectOverride } from './prompts';
import {
  findRouteByUrl,
  getRoutesPaths,
  findRouteMethodByType,
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

export function createOverrideManager(
  options: OverrideOptions
): OverrideManager {
  return {
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

    async select() {
      const routes = options.routeManager.getWithOverrides();
      const { url } = await selectEndpointUrl(getRoutesPaths(routes));
      const route = findRouteByUrl(routes, url);
      const { type } = await selectMethodType(route);
      const overrides = getMethodOverridesByType(route, type);
      const { name } = await selectOverride(
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
