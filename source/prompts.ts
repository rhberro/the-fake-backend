import * as inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import { Route } from './interfaces';
import { getRouteMethodsTypes } from './routes';

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

const filterByPredicate = (list: string[]) => (predicate: string = '') =>
  fuzzy.filter(predicate, list).map(({ original }) => original);

export const selectEndpointUrl = (routePaths: string[]) => {
  const filter = filterByPredicate(routePaths);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'url',
      message: 'Search for the endpoint URL:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
};

export const selectMethodType = (route: Route) => {
  const methodsTypes = getRouteMethodsTypes(route);
  const filter = filterByPredicate(methodsTypes);

  return inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'type',
        message: 'Select the type:',
        source: (_: any, input: string) => Promise.resolve(filter(input)),
      },
    ])
    .then(({ type }) => ({ type: type.toLowerCase() }));
};

export const selectOverride = (overrides: string[]) => {
  const filter = filterByPredicate(overrides);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'name',
      message: 'Select the override settings:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
};

export const selectProxy = (proxies: string[]) => {
  const filter = filterByPredicate(proxies);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'proxy',
      message: 'Select the proxy:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
};
