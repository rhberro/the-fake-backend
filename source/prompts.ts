import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import { prop } from 'ramda';

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

const filterByPredicate = (list: string[]) => (predicate: string = '') =>
  fuzzy.filter(predicate, list).map(prop('original'));

/**
 * Prompts a route path.
 *
 * @param paths The routes paths
 * @return The selected proxy
 */
export function promptRoutePath(paths: string[]): Promise<{ url: string }> {
  const filter = filterByPredicate(paths);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'url',
      message: 'Search for the endpoint URL:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
}

/**
 * Prompts a route method type.
 *
 * @param types The route method types
 * @return The selected type
 */
export function promptRouteMethodType(
  types: string[]
): Promise<{ type: string }> {
  const filter = filterByPredicate(types);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'type',
      message: 'Select the type:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
}

/**
 * Prompts a route method override.
 *
 * @param overrides The route method overrides
 * @return The selected override
 */
export function promptRouteMethodOverride(
  overrides: string[]
): Promise<{ name: string }> {
  const filter = filterByPredicate(overrides);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'name',
      message: 'Select the override settings:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
}

/**
 * Prompts a proxy.
 *
 * @param proxies The current list of proxies
 * @return The selected proxy
 */
export function promptProxy(proxies: string[]): Promise<{ proxy: string }> {
  const filter = filterByPredicate(proxies);

  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'proxy',
      message: 'Select the proxy:',
      source: (_: any, input: string) => Promise.resolve(filter(input)),
    },
  ]);
}
