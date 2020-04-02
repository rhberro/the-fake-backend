import OverrideListenerOptions from './interfaces/OverrideListenerOptions';
import Route from './interfaces/Route';
import Method from './interfaces/Method';
import MethodOverride from './interfaces/MethodOverride';
import inquirer from 'inquirer'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const isNotEmpty = <T>(array: T[]) => array.length > 0

const filterMethodsWithOverrides = (methods: Method[]) =>
  methods.filter(({ overrides }) => overrides && isNotEmpty(overrides))

const filterRoutesWithOverrides = (routes: Route[]) =>
  routes.filter(({ methods }) => isNotEmpty(filterMethodsWithOverrides(methods)))

const getRoutesPaths = (routes: Route[]) =>
  routes.map(({ path }) => path);

const getRouteByUrl = (routes: Route[], url: string) => {
  const route = routes.find(({ path }) => path === url)

  if (route) {
    return route
  }

  throw new Error(`Route with url "${url}" not found`)
};

const getMethodOverridesByType = ({ methods }: Route, routeMethodType: string) => {
  const method = methods.find(({ type }) => type === routeMethodType);

  if (method) {
    const { overrides } = method

    if (overrides) {
      return overrides
    }

    throw new Error(`Method with type "${routeMethodType}" has no "overrides"`)
  }

  throw new Error(`Method with type "${routeMethodType}" not found`)
}

const routeMethodTypesToChoices = (route: Route) => {
  return filterMethodsWithOverrides(route.methods).map(({ type }) => ({
    name: type.toUpperCase(),
    value: type,
  }));
};

const overridesToChoices = (overrides: MethodOverride[]) =>
  overrides.map(({ name }) => ({ name, value: name }));

const filterByPredicate = (list: string[]) => (predicate: string) =>
  predicate ? list.filter(item => item.includes(predicate)) : list

const selectEndpointUrl = (routePaths: string[]) => {
  const filter = filterByPredicate(routePaths)

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'url',
      message: 'Search for the endpoint URL:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
}

const selectMethodType = (route: Route) =>
  inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select the type:',
      choices: routeMethodTypesToChoices(route),
    },
  ]);

const selectOverride = (overrides: MethodOverride[]) =>
  inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: 'Select the override settings:',
      choices: overridesToChoices(overrides),
    },
  ]);

const thisIsAPromise = async (options: OverrideListenerOptions) => {
  const routes = filterRoutesWithOverrides(options.getAllRoutes())
  const { url } = await selectEndpointUrl(getRoutesPaths(routes))
  const route = getRouteByUrl(routes, url)
  const { type } = await selectMethodType(route)
  const overrides = getMethodOverridesByType(route, type)
  const { name } = await selectOverride(overrides)

  options.selectMethodOverride(url, type, name)
}

export const overridesListener = (options: OverrideListenerOptions) => () => {
  return thisIsAPromise(options)
}
