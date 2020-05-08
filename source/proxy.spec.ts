import { mocked } from 'ts-jest/utils';

import { ProxyManager, ProxyProperties, RouteResult } from './interfaces';

import { createProxyManager } from './proxy';
import { MethodType } from './enums';
import { promptProxy } from './prompts';

jest.mock('../source/prompts', () => ({
  promptProxy: jest.fn(),
  promptRoutePath: jest.fn(async () => ({
    url: '/users',
  })),
}));

describe('source/proxy.ts', () => {
  describe('ProxyManager', () => {
    let proxyManager: ProxyManager;
    let routes: RouteResult[] = [];

    const proxies: ProxyProperties[] = [
      { name: 'First', host: 'firsthost.com' },
      { name: 'Second', host: 'secondhost.com' },
      { name: 'Third', host: 'thirdhost.com' },
    ];

    beforeEach(() => {
      routes = [
        { path: '/users', methods: [{ type: MethodType.GET }] },
        { path: '/dogs', methods: [{ type: MethodType.GET }] },
      ];

      proxyManager = createProxyManager(proxies, {
        routeManager: {
          getAll: jest.fn(() => routes),
          setAll: jest.fn(),
        },
      });
    });

    describe('createProxyManager', () => {
      it('returns an instance of ProxyManager', () => {
        expect(proxyManager).toMatchObject<ProxyManager>(proxyManager);
      });
    });

    describe('getAll', () => {
      it('returns the proxies with an additional proxy property', () => {
        expect(proxyManager.getAll()).toEqual([
          { name: 'First', host: 'firsthost.com', proxy: expect.any(Function) },
          {
            name: 'Second',
            host: 'secondhost.com',
            proxy: expect.any(Function),
          },
          { name: 'Third', host: 'thirdhost.com', proxy: expect.any(Function) },
        ]);
      });
    });

    describe('getCurrent', () => {
      it('returns null as the initial proxy', () => {
        expect(proxyManager.getCurrent()).toEqual(null);
      });

      it('returns the first proxy after a toggle', () => {
        proxyManager.toggleCurrent();
        expect(proxyManager.getCurrent()).toEqual({
          name: 'First',
          host: 'firsthost.com',
          proxy: expect.any(Function),
        });
      });
    });

    describe('getOverriddenProxyRoutes', () => {
      it('returns empty list as the initial overridden proxy routes', () => {
        expect(proxyManager.getOverriddenProxyRoutes()).toEqual([]);
      });

      it('returns the overridden routes after overriding a route proxy', () => {
        const proxy = {
          name: 'Second',
          host: 'secondhost.com',
          proxy: () => 'proxy',
        };

        routes[0].proxy = proxy;

        expect(proxyManager.getOverriddenProxyRoutes()).toEqual([
          { path: '/users', methods: [{ type: MethodType.GET }], proxy },
        ]);
      });

      it('returns the overridden routes after toggling and overriding a route proxy', () => {
        proxyManager.toggleCurrent();

        routes[0].proxy = null;

        expect(proxyManager.getOverriddenProxyRoutes()).toEqual([
          { path: '/users', methods: [{ type: MethodType.GET }], proxy: null },
        ]);
      });
    });

    describe('toggleCurrent', () => {
      it('returns null as the initial proxy', () => {
        expect(proxyManager.getCurrent()).toEqual(null);
      });

      it('returns null after toggling from last proxy', () => {
        proxyManager.toggleCurrent();
        proxyManager.toggleCurrent();
        proxyManager.toggleCurrent();
        proxyManager.toggleCurrent();
        expect(proxyManager.getCurrent()).toEqual(null);
      });
    });

    describe('chooseRouteProxy', () => {
      describe('when selecting an existing proxy', () => {
        beforeEach(() => {
          mocked(promptProxy).mockImplementation(async () => ({
            proxy: 'Second',
          }));
        });

        it('prompts and changes a route proxy', async () => {
          await proxyManager.chooseRouteProxy();
          expect(routes[0].proxy).toEqual({
            name: 'Second',
            host: 'secondhost.com',
            proxy: expect.any(Function),
          });
        });
      });

      describe('when selecting the active proxy', () => {
        beforeEach(() => {
          proxyManager.toggleCurrent();
          mocked(promptProxy).mockImplementation(async () => ({
            proxy: 'First',
          }));
        });

        it('prompts and changes a route proxy', async () => {
          await proxyManager.chooseRouteProxy();
          expect(routes[0].proxy).toEqual({
            name: 'First',
            host: 'firsthost.com',
            proxy: expect.any(Function),
          });
        });
      });

      describe('when selecting Local', () => {
        beforeEach(() => {
          mocked(promptProxy).mockImplementation(async () => ({
            proxy: 'Local',
          }));
        });

        it('prompts and sets a null route proxy', async () => {
          await proxyManager.chooseRouteProxy();
          expect(routes[0].proxy).toBeNull();
        });
      });
    });
  });
});
