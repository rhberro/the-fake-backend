import { RouteManager, RouteProperties, Method } from './interfaces';

import {
  createRouteManager,
  findRouteMethodByType,
  findRouteByUrl,
} from './routes';
import { MethodType } from './enums';

describe('source/routes.ts', () => {
  describe('findRouteByUrl', () => {
    const routes: RouteProperties[] = [
      { path: '/users', methods: [{ type: MethodType.GET }] },
      { path: '/dogs', methods: [{ type: MethodType.GET }] },
    ];

    it('throws an error if path is not present', () => {
      expect(() => findRouteByUrl(routes, '/cats')).toThrowError();
    });

    it('returns found routes with the given path', () => {
      expect(findRouteByUrl(routes, '/dogs')).toEqual({
        path: '/dogs',
        methods: [{ type: MethodType.GET }],
      });
    });
  });

  describe('findRouteMethodByType', () => {
    const methods: Method[] = [
      { type: MethodType.GET, code: 201 },
      { type: MethodType.POST },
    ];

    it('throws an error if type is not present', () => {
      expect(() =>
        findRouteMethodByType(methods, MethodType.PATCH)
      ).toThrowError();
    });

    it('returns found methods with the given type', () => {
      expect(findRouteMethodByType(methods, MethodType.GET)).toEqual({
        type: MethodType.GET,
        code: 201,
      });
    });
  });

  describe('RouteManager', () => {
    let routeManager: RouteManager;

    describe('when has not global overrides', () => {
      const routes: RouteProperties[] = [
        { path: '/users', methods: [{ type: MethodType.GET }] },
        { path: '/dogs', methods: [{ type: MethodType.GET }] },
      ];

      beforeEach(() => {
        routeManager = createRouteManager({});
      });

      describe('createRouteManager', () => {
        it('returns an instance of RouteManager', () => {
          expect(routeManager).toMatchObject<RouteManager>(routeManager);
        });
      });

      describe('getAll', () => {
        it('returns empty list as initial current routes', () => {
          expect(routeManager.getAll()).toEqual([]);
        });

        describe('when setting routes', () => {
          beforeEach(() => {
            routeManager.setAll(routes);
          });

          it('return the current routes with an additional proxy property', () => {
            expect(routeManager.getAll()).toEqual([
              {
                path: '/users',
                methods: [{ type: MethodType.GET }],
              },
              {
                path: '/dogs',
                methods: [{ type: MethodType.GET }],
              },
            ]);
          });
        });
      });

      describe('setAll', () => {
        it('clears the current routes and set new ones', () => {
          routeManager.setAll(routes);
          routeManager.setAll([
            {
              path: '/cats',
              methods: [{ type: MethodType.GET }],
            },
          ]);

          expect(routeManager.getAll()).toHaveLength(1);
        });

        it('clears the current routes if an empty array is given', () => {
          routeManager.setAll(routes);
          routeManager.setAll([]);

          expect(routeManager.getAll()).toHaveLength(0);
        });
      });
    });

    describe('when has global overrides', () => {
      const routes: RouteProperties[] = [
        { path: '/users', methods: [{ type: MethodType.GET }] },
        {
          path: '/dogs',
          methods: [
            {
              type: MethodType.GET,
              overrides: [{ name: 'Error 404', code: 404 }],
            },
          ],
        },
      ];

      beforeEach(() => {
        routeManager = createRouteManager({
          globalOverrides: [
            {
              name: 'Error 500',
              code: 500,
            },
          ],
        });
      });

      describe('createRouteManager', () => {
        it('returns an instance of RouteManager', () => {
          expect(routeManager).toMatchObject<RouteManager>(routeManager);
        });
      });

      describe('getAll', () => {
        it('returns empty list as initial current routes', () => {
          expect(routeManager.getAll()).toEqual([]);
        });

        describe('when setting routes', () => {
          beforeEach(() => {
            routeManager.setAll(routes);
          });

          it('return the current routes with an additional proxy property and overrides', () => {
            expect(routeManager.getAll()).toEqual([
              {
                path: '/users',
                methods: [
                  {
                    type: MethodType.GET,
                    overrides: [
                      {
                        name: 'Error 500 (Global)',
                        code: 500,
                      },
                    ],
                  },
                ],
              },
              {
                path: '/dogs',
                methods: [
                  {
                    type: MethodType.GET,
                    overrides: [
                      {
                        name: 'Error 404',
                        code: 404,
                      },
                      {
                        name: 'Error 500 (Global)',
                        code: 500,
                      },
                    ],
                  },
                ],
              },
            ]);
          });
        });
      });

      describe('setAll', () => {
        it('clears the current routes and set new ones', () => {
          routeManager.setAll(routes);
          routeManager.setAll([
            {
              path: '/cats',
              methods: [{ type: MethodType.GET }],
            },
          ]);

          expect(routeManager.getAll()).toHaveLength(1);
        });

        it('clears the current routes if an empty array is given', () => {
          routeManager.setAll(routes);
          routeManager.setAll([]);

          expect(routeManager.getAll()).toHaveLength(0);
        });
      });
    });
  });
});
