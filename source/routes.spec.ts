import { RouteProperties, Method, Response, Middleware } from './interfaces';

import { findRouteMethodByType, findRouteByUrl, RouteManager } from './routes';
import { MethodType } from './enums';
import { getMockReq, getMockRes } from '@jest-mock/express';

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
        {
          path: '/users',
          methods: [{ type: MethodType.GET, data: ['First user'] }],
        },
        { path: '/dogs', methods: [{ type: MethodType.GET }] },
      ];

      beforeEach(() => {
        routeManager = new RouteManager();
      });

      describe('constructor', () => {
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
                methods: [{ type: MethodType.GET, data: ['First user'] }],
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

      describe('createResolvedRouteMiddleware', () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();
        let middleware: Middleware;

        beforeEach(() => {
          routeManager.setAll(routes);
          req.path = routes[0].path;
          req.method = routes[0].methods[0].type;
          res.locals = {
            route: routes[0],
            routeMethod: routes[0].methods[0],
            response: routes[0].methods[0].data,
          };

          middleware = routeManager.createResolvedRouteMiddleware({
            proxies: [],
            throttlings: [],
          });
        });

        it('resolves the route of a given request', () => {
          middleware(req, res, next);
          expect(res.locals.route).toEqual(routes[0]);
        });
      });

      describe('createRouteMethodResponseMiddleware', () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();
        let middleware: Middleware;

        beforeEach(() => {
          routeManager.setAll(routes);
          req.path = routes[0].path;
          req.method = routes[0].methods[0].type;
          res.locals = {
            route: routes[0],
            routeMethod: routes[0].methods[0],
            response: routes[0].methods[0].data,
          };

          middleware = routeManager.createRouteMethodResponseMiddleware();
        });

        it('resolves the response of a given request', () => {
          middleware(req, res, next);
          expect(res.locals.response).toEqual(routes[0].methods[0].data);
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
        routeManager = new RouteManager([
          {
            name: 'Error 500',
            code: 500,
          },
        ]);
      });

      describe('constructor', () => {
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
