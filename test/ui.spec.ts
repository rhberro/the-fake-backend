import {
  UIManager,
  RouteResult,
  OverrideSelectResult,
  Throttling,
  ProxyResult,
} from '../source/interfaces';

import { createUIManager } from '../source/ui';
import { MethodType } from '../source/enums';
const stripAnsi = require('strip-ansi');

const write = jest.fn((text) => stripAnsi(text).trim());

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    write,
  })),
}));

describe('source/ui.ts', () => {
  describe('UIManager', () => {
    let uiManager: UIManager;

    const proxyManager = {
      getAll: jest.fn(() => [
        { name: 'First', host: 'firsthost.com' },
        { name: 'Second', host: 'secondhost.com' },
        { name: 'Third', host: 'thirdhost.com' },
      ]),
      getCurrent: jest.fn(),
      getOverriddenProxyRoutes: jest.fn((): RouteResult[] => []),
      toggleCurrent: jest.fn(),
      chooseRouteProxy: jest.fn(),
    };

    const throttlingManager = {
      getAll: jest.fn(),
      getCurrent: jest.fn(),
      getCurrentDelay: jest.fn(),
      toggleCurrent: jest.fn(),
    };

    const overrideManager = {
      getAll: jest.fn(),
      getAllSelected: jest.fn((): OverrideSelectResult[] => []),
      choose: jest.fn(),
    };

    beforeEach(() => {
      uiManager = createUIManager(
        proxyManager,
        throttlingManager,
        overrideManager
      );
    });

    describe('createUIManager', () => {
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
            proxyManager.getCurrent.mockImplementation(() => ({
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
            proxyManager.getOverriddenProxyRoutes.mockImplementation(() => [
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
            proxyManager.getCurrent.mockImplementation(
              (): ProxyResult => ({
                name: 'Second',
                host: 'secondhost.com',
                proxy: () => 'proxy',
              })
            );
            proxyManager.getOverriddenProxyRoutes.mockImplementation(() => [
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
            throttlingManager.getCurrent.mockImplementation(
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
            overrideManager.getAllSelected.mockImplementation(() => [
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

      describe('writeMethodOverrideChanged', () => {
        it('prints that the route method override has changed', () => {
          uiManager.writeMethodOverrideChanged(
            '/dogs',
            MethodType.GET,
            'Dogoo'
          );

          expect(write).toHaveReturnedWith(
            'Endpoint GET /dogs changed to response Dogoo'
          );
        });
      });

      describe('writeRouteProxyChanged', () => {
        it('prints that the route proxy has changed', () => {
          uiManager.writeRouteProxyChanged('/dogs', 'Second');

          expect(write).toHaveReturnedWith(
            'Route /dogs changed to proxy Second'
          );
        });
      });
    });
  });
});
