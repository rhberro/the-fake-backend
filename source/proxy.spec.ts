import { mocked } from 'ts-jest/utils';
import { getMockReq, getMockRes } from '@jest-mock/express';

import { ProxyProperties, Response, Route } from './interfaces';

import { ProxyManager } from './proxy';
import { MethodType } from './enums';
import { promptProxy } from './prompts';
import { RouteManager } from './routes';
import { Middleware } from './types';

jest.mock('../source/prompts', () => ({
  promptProxy: jest.fn(),
  promptRoutePath: jest.fn(async () => ({
    url: '/users',
  })),
}));

describe('source/proxy.ts', () => {
  describe('ProxyManager', () => {
    let proxyManager: ProxyManager;
    let routes: Route[] = [];

    const proxies: ProxyProperties[] = [
      { name: 'First', host: 'firsthost.com' },
      { name: 'Second', host: 'secondhost.com' },
      { name: 'Third', host: 'thirdhost.com', appendBasePath: false },
    ];

    beforeEach(() => {
      routes = [
        { path: '/users', methods: [{ type: MethodType.GET }] },
        { path: '/dogs', methods: [{ type: MethodType.GET }] },
      ];

      const routeManager = new RouteManager();
      routeManager.setAll(routes);

      proxyManager = new ProxyManager(routeManager, proxies);
    });

    describe('constructor', () => {
      it('returns an instance of ProxyManager', () => {
        expect(proxyManager).toMatchObject<ProxyManager>(proxyManager);
      });
    });

    describe('getAll', () => {
      it('returns the proxies with an additional handler property', () => {
        expect(proxyManager.getAll()).toEqual([
          {
            name: 'First',
            host: 'firsthost.com',
            handler: expect.any(Function),
          },
          {
            name: 'Second',
            host: 'secondhost.com',
            handler: expect.any(Function),
          },
          {
            name: 'Third',
            host: 'thirdhost.com',
            handler: expect.any(Function),
          },
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
          handler: expect.any(Function),
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
          handler: () => 'proxy',
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
            handler: expect.any(Function),
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
            handler: expect.any(Function),
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

    describe('createRouteMiddleware', () => {
      const mockedRequest = getMockReq();
      const mockedResponse = getMockRes().res as Response;
      const mockedNext = jest.fn();
      let middleware: Middleware;

      beforeEach(() => {
        middleware = proxyManager.createRouteMiddleware();
      });

      it('resolves to the route proxy when route has an active proxy', () => {
        const secondProxy = proxyManager.getAll()[1];
        routes[0].proxy = secondProxy;
        mockedResponse.locals = {
          route: routes[0],
          routeMethod: routes[0].methods[0],
          response: undefined,
        };

        middleware(mockedRequest, mockedResponse, mockedNext);
        expect(mockedNext).toHaveBeenLastCalledWith(secondProxy.host);
      });
    });

    describe('createGlobalMiddleware', () => {
      const mockedRequest = getMockReq();
      const mockedResponse = getMockRes().res as Response;
      const mockedNext = jest.fn();
      let middleware: Middleware;

      beforeEach(() => {
        middleware = proxyManager.createGlobalMiddleware();
      });

      it('resolves to the server proxy when server has an active proxy', () => {
        proxyManager.toggleCurrent();

        middleware(mockedRequest, mockedResponse, mockedNext);
        expect(mockedNext).toHaveBeenLastCalledWith(proxies[0].host);
      });
    });
  });
});
