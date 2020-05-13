import { mocked } from 'ts-jest/utils';

import { RouteProperties } from './interfaces';

import { MethodType } from './enums';
import {
  promptRoutePath,
  promptRouteMethodType,
  promptRouteMethodOverride,
} from './prompts';
import { OverrideManager } from './overrides';
import { RouteManager } from './routes';

jest.mock('../source/prompts');

describe('source/override.ts', () => {
  describe('OverrideManager', () => {
    let overrideManager: OverrideManager;

    const routes: RouteProperties[] = [
      { path: '/users', methods: [{ type: MethodType.GET }] },
      {
        path: '/cats',
        methods: [
          { type: MethodType.GET, overrides: [{ name: 'Cat', data: 'Cat' }] },
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

    describe('createOverrideManager', () => {
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

          mocked(promptRoutePath).mockImplementation(async () => ({
            url: '/dogs',
          }));
          mocked(promptRouteMethodType).mockImplementation(async () => ({
            type: 'GET',
          }));
          mocked(promptRouteMethodOverride).mockImplementation(async () => ({
            name: 'Doggernaut',
          }));
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
  });
});
