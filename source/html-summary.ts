import { compose, prop, sortBy, toLower } from 'ramda';
import { Route } from './interfaces';

const methods = (route: Route): string =>
  `[${route.methods.map((m) => m.type.toUpperCase()).join(', ')}]`;

const trimTrailing = (s: string): string => {
  return s.replace(/^\//, '');
};

const routeToHtml = (basePath?: string) => (route: Route): string => {
  const path = trimTrailing(route.path);
  return `<div>
    <span>${methods(route)} </span>
    <a href="${`${basePath}/${path}`}">${path}</a>
  </div>`;
};

const sortByPath = sortBy(compose(toLower, prop('path')));

const htmlSummary = (routes: Route[], basePath?: string): string => {
  const sorted = sortByPath([...routes]);
  const htmlRoutes = sorted.map(routeToHtml(basePath));
  return `<div>${htmlRoutes.join('')}</div>`;
};

export default htmlSummary;
