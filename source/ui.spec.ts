import { Route, Override, Throttling, Proxy } from './interfaces';

import { MethodType } from './enums';
import { UIManager } from './ui';
import { ProxyManager } from './proxy';
import { RouteManager } from './routes';
import { ThrottlingManager } from './throttling';
import { OverrideManager } from './overrides';
const stripAnsi = require('strip-ansi');

const write = jest.fn((text) => stripAnsi(text).trim());
const getCurrentProxy = jest.fn();
const getCurrentThrottling = jest.fn();
const getOverriddenProxyRoutes = jest.fn((): Route[] => []);
const getSelectedOverrides = jest.fn((): Override[] => []);

jest.mock('./proxy', () => ({
  ProxyManager: () => ({
    getAll: jest.fn(() => [
      { name: 'First', host: 'firsthost.com', proxy: () => 'proxy' },
      { name: 'Second', host: 'secondhost.com', proxy: () => 'proxy' },
      { name: 'Third', host: 'thirdhost.com', proxy: () => 'proxy' },
    ]),
    getCurrent: getCurrentProxy,
    getOverriddenProxyRoutes,
    toggleCurrent: jest.fn(),
    chooseRouteProxy: jest.fn(),
  }),
}));

jest.mock('./throttling', () => ({
  ThrottlingManager: () => ({
    getAll: jest.fn(),
    getCurrent: getCurrentThrottling,
    getCurrentDelay: jest.fn(),
    toggleCurrent: jest.fn(),
  }),
}));

jest.mock('./overrides', () => ({
  OverrideManager: () => ({
    getAll: jest.fn(),
    getAllSelected: getSelectedOverrides,
    choose: jest.fn(),
  }),
}));

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    write,
  })),
}));

describe('source/ui.ts', () => {
  describe('UIManager', () => {
    let uiManager: UIManager;
    const routeManager = new RouteManager();
    const proxyManager = new ProxyManager([], routeManager);
    const throttlingManager = new ThrottlingManager();
    const overrideManager = new OverrideManager(routeManager);

    beforeEach(() => {
      uiManager = new UIManager(
        proxyManager,
        throttlingManager,
        overrideManager
      );
    });

    describe('constructor', () => {
      it('returns an instance of UIManager', () => {
        expect(uiManager).toMatchObject<UIManager>(uiManager);
      });

      describe('drawDashboard', () => {
        it('prints the sections', () => {
          uiManager.drawDashboard();

          expect(write).toHaveReturnedWith('The service is running!');
          expect(write).toHaveReturnedWith('Connection:');
          expect(write).toHaveReturnedWith('Connection overrides:');
          expect(write).toHaveReturnedWith('Throttling:');
          expect(write).toHaveReturnedWith('Overrides:');
          expect(write).toHaveReturnedWith('Available commands:');
        });

        describe('when a proxy is selected', () => {
          beforeEach(() => {
            getCurrentProxy.mockImplementation(() => ({
              name: 'First',
              host: 'firsthost.com',
            }));
          });

          it('displays the connection name', () => {
            uiManager.drawDashboard();
            expect(write).toHaveReturnedWith('First firsthost.com');
          });
        });

        describe('when a route proxy is selected', () => {
          beforeEach(() => {
            getOverriddenProxyRoutes.mockImplementation(() => [
              {
                path: '/users',
                methods: [{ type: MethodType.GET }],
                proxy: {
                  name: 'Second',
                  host: 'secondhost.com',
                  proxy: () => 'proxy',
                },
              },
            ]);
          });

          it('displays the connection name', () => {
            uiManager.drawDashboard();
            expect(write).toHaveReturnedWith('- /users: Second');
          });
        });

        describe('when local is selected as route proxy and it is not the current server proxy', () => {
          beforeEach(() => {
            getCurrentProxy.mockImplementation(
              (): Proxy => ({
                name: 'Second',
                host: 'secondhost.com',
                proxy: () => 'proxy',
              })
            );
            getOverriddenProxyRoutes.mockImplementation(() => [
              {
                path: '/users',
                methods: [{ type: MethodType.GET }],
                proxy: null,
              },
            ]);
          });

          it('displays the connection name', () => {
            uiManager.drawDashboard();
            expect(write).toHaveReturnedWith('- /users: Local');
          });
        });

        describe('when a throttling is selected', () => {
          beforeEach(() => {
            getCurrentThrottling.mockImplementation(
              (): Throttling => ({
                name: 'Slow',
                values: [300, 500],
              })
            );
          });

          it('displays the throttling', () => {
            uiManager.drawDashboard();
            expect(write).toHaveReturnedWith('Slow 300 - 500 ms');
          });
        });

        describe('when a route method override is selected', () => {
          beforeEach(() => {
            getSelectedOverrides.mockImplementation(() => [
              {
                routePath: '/dogs',
                methodType: MethodType.GET,
                name: 'Dogoo',
              },
            ]);
          });

          it('displays the connection name', () => {
            uiManager.drawDashboard();
            expect(write).toHaveReturnedWith('- GET /dogs: Dogoo');
          });
        });
      });

      describe('drawMethodOverrideChanged', () => {
        it('prints that the route method override has changed', () => {
          uiManager.drawMethodOverrideChanged('/dogs', MethodType.GET, 'Dogoo');

          expect(write).toHaveReturnedWith(
            'Endpoint GET /dogs changed to response Dogoo'
          );
        });
      });

      describe('drawRouteProxyChanged', () => {
        it('prints that the route proxy has changed', () => {
          uiManager.drawRouteProxyChanged('/dogs', 'Second');

          expect(write).toHaveReturnedWith(
            'Route /dogs changed to proxy Second'
          );
        });
      });
    });
  });
});
