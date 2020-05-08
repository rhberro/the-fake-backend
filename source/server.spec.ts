import { createServer } from './server';
import {
  Server,
  InputManager,
  RouteManager,
  Route,
  UIManager,
} from './interfaces';
import { MethodType } from './enums';

jest.mock('../source/ui', () => ({
  createUIManager: (): UIManager => ({
    drawDashboard: jest.fn(),
    drawRequest: jest.fn(),
    writeRouteProxyChanged: jest.fn(),
    writeMethodOverrideChanged: jest.fn(),
  }),
}));

jest.mock('../source/routes', () => ({
  createRouteManager: (): RouteManager => ({
    getAll: jest.fn(() => []),
    setAll: jest.fn(),
  }),
}));

jest.mock('../source/input', () => ({
  createInputManager: (): InputManager => ({
    addListener: jest.fn(),
    init: jest.fn(),
  }),
}));

const expressServer = {
  get: jest.fn((path: string, response: Function) =>
    response(
      { type: 'get' },
      { path, methods: [{ type: 'get' }] },
      jest.fn(),
      jest.fn()
    )
  ),
  use: jest.fn(),
  listen: jest.fn(),
};

jest.mock('express', () => {
  return () => {
    return expressServer;
  };
});

describe('source/server.ts', () => {
  describe('InputManager', () => {
    let server: Server;

    beforeEach(() => {
      server = createServer();
    });

    describe('createServer', () => {
      it('returns an instance of Server', () => {
        expect(server).toMatchObject<Server>(server);
      });
    });

    describe('routes', () => {
      it('defines the server routes', () => {
        const routes: Route[] = [
          {
            path: '/users',
            methods: [{ type: MethodType.GET, data: 'Users' }],
          },
          { path: '/dogs', methods: [{ type: MethodType.GET, data: 'Dogs' }] },
          {
            path: '/cats',
            methods: [
              {
                type: MethodType.GET,
                data: [{ name: 'Cat' }],
              },
            ],
          },
        ];
        server.routes(routes);
        expect(expressServer.get).toHaveBeenCalled();
      });
    });

    describe('listen', () => {
      it('starts listening on given ports', () => {
        server.listen(8081);
        expect(expressServer.listen).toHaveBeenCalledWith(8081);
      });
    });
  });
});
