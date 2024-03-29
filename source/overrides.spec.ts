import { getMockReq, getMockRes } from '@jest-mock/express';
import { mocked } from 'ts-jest/utils';
import { fs as inMemoryFileSystem } from 'memfs';

import { Response, RouteProperties } from './interfaces';

import { MethodType } from './enums';
import {
  promptRoutePath,
  promptRouteMethodType,
  promptRouteMethodOverride,
} from './prompts';
import { OverrideManager } from './overrides';
import { RouteManager } from './routes';
import { Middleware } from './types';
import { FileStorage } from './storage';

jest.mock('../source/prompts');

describe('source/override.ts', () => {
  describe('OverrideManager', () => {
    let overrideManager: OverrideManager;

    const routes: RouteProperties[] = [
      {
        path: '/users',
        methods: [
          {
            type: MethodType.GET,
            data: 'User',
            overrideContent: (_, content) => `Happy ${content}`,
          },
        ],
      },
      {
        path: '/cats',
        methods: [
          {
            type: MethodType.GET,
            data: 'Original cat',
            overrides: [{ name: 'Cat', data: 'Cat' }],
          },
        ],
      },
      {
        path: '/dogs',
        methods: [
          {
            type: MethodType.GET,
            overrides: [
              { name: 'Dogoo', data: 'Dogoo', selected: true },
              { name: 'Doggernaut', data: 'Doggernaut' },
            ],
          },
          {
            type: MethodType.POST,
            overrides: [
              {
                name: 'Too many dogs',
                code: 400,
                selected: true,
              },
            ],
          },
          {
            type: MethodType.PATCH,
          },
        ],
      },
    ];

    const routeManager = new RouteManager();
    routeManager.setAll(routes);

    beforeEach(() => {
      overrideManager = new OverrideManager(routeManager);
    });

    describe('constructor', () => {
      it('returns an instance of OverrideManager', () => {
        expect(overrideManager).toMatchObject<OverrideManager>(overrideManager);
      });
    });

    describe('getAll', () => {
      describe('when routes are empty', () => {
        beforeEach(() => {
          routeManager.setAll([]);
        });

        it('returns an empty list', () => {
          expect(overrideManager.getAll()).toEqual([]);
        });
      });

      describe('when there are no possible overrides', () => {
        beforeEach(() => {
          routeManager.setAll([
            { path: '/users', methods: [{ type: MethodType.GET }] },
            { path: '/dogs', methods: [{ type: MethodType.GET }] },
          ]);
        });

        it('returns an empty list', () => {
          expect(overrideManager.getAll()).toEqual([]);
        });
      });

      describe('when there are possible overrides', () => {
        beforeEach(() => {
          routeManager.setAll(routes);
        });

        it('returns all the routes with possible overrides', () => {
          expect(overrideManager.getAll()).toEqual([
            {
              path: '/cats',
              methods: [
                {
                  type: MethodType.GET,
                  data: 'Original cat',
                  overrides: [{ name: 'Cat', data: 'Cat' }],
                },
              ],
            },
            {
              path: '/dogs',
              methods: [
                {
                  type: MethodType.GET,
                  overrides: [
                    { name: 'Dogoo', data: 'Dogoo', selected: true },
                    { name: 'Doggernaut', data: 'Doggernaut' },
                  ],
                },
                {
                  type: MethodType.POST,
                  overrides: [
                    {
                      name: 'Too many dogs',
                      code: 400,
                      selected: true,
                    },
                  ],
                },
                {
                  type: MethodType.PATCH,
                },
              ],
            },
          ]);
        });
      });
    });

    describe('getAllSelected', () => {
      describe('when routes are empty', () => {
        beforeEach(() => {
          routeManager.setAll([]);
        });

        it('returns an empty list', () => {
          expect(overrideManager.getAllSelected()).toEqual([]);
        });
      });

      describe('when there are no possible overrides', () => {
        beforeEach(() => {
          routeManager.setAll([
            { path: '/users', methods: [{ type: MethodType.GET }] },
            { path: '/dogs', methods: [{ type: MethodType.GET }] },
          ]);
        });

        it('returns an empty list', () => {
          expect(overrideManager.getAllSelected()).toEqual([]);
        });
      });

      describe('when there are possible overrides', () => {
        beforeEach(() => {
          routeManager.setAll([
            { path: '/users', methods: [{ type: MethodType.GET }] },
            {
              path: '/dogs',
              methods: [
                {
                  type: MethodType.GET,
                  overrides: [{ name: 'Dogoo', data: 'Dogoo' }],
                },
              ],
            },
          ]);
        });

        it('returns an empty list', () => {
          expect(overrideManager.getAllSelected()).toEqual([]);
        });
      });

      describe('when there are selected overrides', () => {
        beforeEach(() => {
          routeManager.setAll(routes);
        });

        it('returns selected overrides', () => {
          expect(overrideManager.getAllSelected()).toEqual([
            {
              routePath: '/dogs',
              methodType: MethodType.GET,
              name: 'Dogoo',
            },
            {
              routePath: '/dogs',
              methodType: MethodType.POST,
              name: 'Too many dogs',
            },
          ]);
        });
      });
    });

    describe('choose', () => {
      describe('when selecting a method override', () => {
        beforeEach(() => {
          routeManager.setAll(routes);
          mockOverridePrompts('GET', '/dogs', 'Doggernaut');
        });

        it('prompts and changes a route method override', async () => {
          await overrideManager.choose();
          expect(
            routes
              ?.find(({ path }) => path === '/dogs')
              ?.methods?.find(({ type }) => type === MethodType.GET)
              ?.overrides?.find(({ name }) => name === 'Doggernaut')?.selected
          ).toBe(true);
        });
      });
    });

    describe('createOverriddenRouteMethodMiddleware', () => {
      let middleware: Middleware;

      beforeEach(() => {
        middleware = overrideManager.createOverriddenRouteMethodMiddleware();
      });

      describe("when the route doesn't have a selected override", () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();

        beforeEach(() => {
          const route = routes[1];
          const routeMethod = route.methods[0];

          req.path = route.path;
          req.method = routeMethod.type;
          res.locals = {
            route,
            routeMethod,
            response: routeMethod.data,
          };
        });

        it('preserves the original route method', () => {
          middleware(req, res, next);
          expect(res.locals.routeMethod.data).toEqual('Original cat');
        });
      });

      describe('when the route has a selected override', () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();

        beforeEach(() => {
          const route = routes[2];
          const routeMethod = route.methods[1];

          req.path = route.path;
          req.method = routeMethod.type;
          res.locals = {
            route,
            routeMethod,
            response: routeMethod.data,
          };
        });

        it('overrides res.locals.routeMethod', () => {
          middleware(req, res, next);
          expect(res.locals.routeMethod.code).toEqual(400);
        });
      });
    });

    describe('createOverriddenRouteMethodMiddleware', () => {
      let middleware: Middleware;

      beforeEach(() => {
        middleware = overrideManager.createOverriddenRouteContentMiddleware();
      });

      describe("when the route doesn't have overrideContent", () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();

        beforeEach(() => {
          const route = routes[1];
          const routeMethod = route.methods[0];

          req.path = route.path;
          req.method = routeMethod.type;
          res.locals = {
            route,
            routeMethod,
            response: routeMethod.data,
          };
        });

        it('keeps original res.locals.response', () => {
          middleware(req, res, next);
          expect(res.locals.response).toEqual('Original cat');
        });
      });

      describe('when the route has overrideContent', () => {
        const req = getMockReq();
        const res = getMockRes().res as Response;
        const next = jest.fn();

        beforeEach(() => {
          const route = routes[0];
          const routeMethod = route.methods[0];

          req.path = route.path;
          req.method = routeMethod.type;
          res.locals = {
            route,
            routeMethod,
            response: routeMethod.data,
          };
        });

        it('overrides res.locals.response', () => {
          middleware(req, res, next);
          expect(res.locals.response).toEqual('Happy User');
        });
      });
    });

    describe('OverrideManager with FileStorage', () => {
      const override = {
        routePath: '/dogs',
        methodType: 'get',
        name: 'Doggernaut',
      };

      function createOverrideManager(fileStorage: FileStorage<'overrides'>) {
        const overrideManager = new OverrideManager(routeManager, fileStorage);
        overrideManager.applyExternalOverrides();
      }

      it('loads overrides from file storage', () => {
        const fileStorage = createFileStorage();
        fileStorage.setItem('overrides', [override]);
        createOverrideManager(fileStorage);
        expect(overrideManager.getAllSelected()).toContainEqual(override);
      });

      it('persists an override to file storage', async () => {
        const fileStorage = createFileStorage();
        mockOverridePrompts('GET', '/dogs', 'Doggernaut');
        createOverrideManager(fileStorage);
        await overrideManager.choose();
        expect(fileStorage.getItem('overrides')).toContainEqual(override);
      });

      it('properly clears and apply external (file) overrides', async () => {
        const fileStorage = createFileStorage();
        fileStorage.setItem('overrides', [override]);
        const overrideManager = new OverrideManager(routeManager, fileStorage);
        overrideManager.applyExternalOverrides();
        expect(fileStorage.getItem('overrides')).toContainEqual(override);

        fileStorage.clear();
        expect(fileStorage.isEmpty()).toBeTruthy();

        overrideManager.applyExternalOverrides();
        expect(fileStorage.getItem('overrides')).toContainEqual(override);
      });
    });
  });
});

function mockOverridePrompts(
  methodType: string,
  routePath: string,
  name: string
) {
  mocked(promptRoutePath).mockImplementation(async () => ({
    url: routePath,
  }));
  mocked(promptRouteMethodType).mockImplementation(async () => ({
    type: methodType,
  }));
  mocked(promptRouteMethodOverride).mockImplementation(async () => ({
    name: name,
  }));
}

function createFileStorage() {
  return new FileStorage<'overrides'>({
    enabled: true,
    path: '/.storage',
    fs: inMemoryFileSystem as any,
  });
}
