import { RouteProperties } from './interfaces';

import { findRouteByUrl } from './routes';
import { MethodType } from './enums';

describe('source/html-summary.ts', () => {
  describe('htmlSummary', () => {
    const routes: RouteProperties[] = [
      { path: '/users', methods: [{ type: MethodType.GET }] },
      { path: '/dogs', methods: [{ type: MethodType.GET }] },
    ];

    it('prints the routes as HTML', () => {
      expect(() => findRouteByUrl(routes, '/cats')).toThrowError();
    });
  });
});
