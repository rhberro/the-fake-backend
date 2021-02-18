import { Middleware, Response, Route, Throttling } from './interfaces';
import { getMockReq, getMockRes } from '@jest-mock/express';

import { ThrottlingManager } from './throttling';
import { MethodType } from './enums';
import { mocked } from 'ts-jest/utils';

jest.useFakeTimers();

describe('source/throttling.ts', () => {
  describe('ThrottlingManager', () => {
    let throttlingManager: ThrottlingManager;
    let routes: Route[] = [];

    const throttlings: Array<Throttling> = [
      { name: 'First', values: [0, 5000] },
      { name: 'Second', values: [5000, 10000] },
      { name: 'Third', values: [10000, 20000] },
    ];

    beforeEach(() => {
      routes = [
        { path: '/users', methods: [{ type: MethodType.GET }] },
        { path: '/dogs', methods: [{ type: MethodType.GET }] },
      ];

      throttlingManager = new ThrottlingManager(throttlings);
    });

    describe('constructor', () => {
      it('returns an instance of ThrottlingManager', () => {
        expect(throttlingManager).toMatchObject<ThrottlingManager>(
          throttlingManager
        );
      });
    });

    describe('getAll', () => {
      it('returns all the throttlings', () => {
        expect(throttlingManager.getAll()).toEqual(throttlings);
      });
    });

    describe('getCurrent', () => {
      it('returns null as the initial throttling', () => {
        expect(throttlingManager.getCurrent()).toEqual(null);
      });

      it('returns the first throttling after a toggle', () => {
        throttlingManager.toggleCurrent();
        expect(throttlingManager.getCurrent()).toEqual(throttlings[0]);
      });
    });

    describe('getCurrentDelay', () => {
      it('returns 0 as the initial throttling', () => {
        expect(throttlingManager.getCurrentDelay()).toEqual(0);
      });

      it('returns a number between the first throttling values', () => {
        throttlingManager.toggleCurrent();
        const currentDelay = throttlingManager.getCurrentDelay();
        expect(currentDelay).toBeGreaterThanOrEqual(throttlings[0].values[0]);
        expect(currentDelay).toBeLessThanOrEqual(throttlings[0].values[1]);
      });
    });

    describe('toggleCurrent', () => {
      it('returns null as the initial throttling', () => {
        expect(throttlingManager.getCurrent()).toEqual(null);
      });

      it('returns null after toggling from last throttling', () => {
        throttlingManager.toggleCurrent();
        throttlingManager.toggleCurrent();
        throttlingManager.toggleCurrent();
        throttlingManager.toggleCurrent();
        expect(throttlingManager.getCurrent()).toEqual(null);
      });
    });

    describe('createMiddleware', () => {
      const mockedRequest = getMockReq();
      const mockedResponse = getMockRes().res as Response;
      const mockedNext = jest.fn();
      let middleware: Middleware;

      beforeEach(() => {
        middleware = throttlingManager.createMiddleware();
        jest.spyOn(global.Math, 'random').mockReturnValue(0);
      });

      it('resolves to the route delay when route has an active throttling', () => {
        routes[0].methods[0].delay = 3000;
        mockedResponse.locals = {
          route: routes[0],
          routeMethod: routes[0].methods[0],
          response: undefined,
        };

        middleware(mockedRequest, mockedResponse, mockedNext);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
      });

      it('resolves to the server proxy when server has an active proxy', () => {
        throttlingManager.toggleCurrent();
        mockedResponse.locals = {
          route: routes[1],
          routeMethod: routes[1].methods[0],
          response: undefined,
        };

        middleware(mockedRequest, mockedResponse, mockedNext);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 5000);
      });
    });
  });
});
