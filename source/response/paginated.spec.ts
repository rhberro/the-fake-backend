import { Method, Response, ServerOptions } from '../interfaces';
import { MethodType } from '../enums';
import { getMockReq, getMockRes } from '@jest-mock/express';
import createPaginatedMiddleware from './paginated';

describe('source/response/paginated.ts', () => {
  describe('createPaginatedMiddleware', () => {
    const content = ['Dog', 'Doogo', 'Dogger', 'Doggernaut', 'Dogging'];
    const next = jest.fn();

    describe('when server has default pagination options', () => {
      const serverOptions: ServerOptions = {
        proxies: [],
        throttlings: [],
      };

      const middleware = createPaginatedMiddleware(serverOptions);

      describe('when method uses default pagination options', () => {
        const method: Method = {
          type: MethodType.GET,
          pagination: true,
        };

        it('creates a paginated response object with data and metadata', () => {
          const req = getMockReq();
          const res = getMockRes().res as Response;
          res.locals = {
            route: { path: '/users', methods: [method] },
            routeMethod: method,
            response: content,
          };

          middleware(req, res, next);
          expect(res.locals.response).toBeInstanceOf(Object);
        });

        describe('when using page/size query parameters', () => {
          const req = getMockReq({ query: { page: '0', size: '2' } });
          const res = getMockRes().res as Response;
          res.locals = {
            route: { path: '/users', methods: [method] },
            routeMethod: method,
            response: content,
          };

          it('creates a paginated response object with data and metadata', () => {
            middleware(req, res, next);

            expect(res.locals.response.data).toEqual(['Dog', 'Doogo']);
          });
        });

        describe('when using offset/size query parameters', () => {
          const req = getMockReq({ query: { offset: '2', size: '2' } });
          const res = getMockRes().res as Response;
          res.locals = {
            route: { path: '/users', methods: [method] },
            routeMethod: method,
            response: content,
          };

          it('slices from offset', () => {
            middleware(req, res, next);

            expect(res.locals.response.data).toEqual(['Dogger', 'Doggernaut']);
          });
        });

        describe('when size query parameter is missing', () => {
          const req = getMockReq({ query: { offset: '0' } });
          const res = getMockRes().res as Response;
          res.locals = {
            route: { path: '/users', methods: [method] },
            routeMethod: method,
            response: content,
          };

          it('uses the default page size', () => {
            middleware(req, res, next);

            expect(res.locals.response.data).toHaveLength(5);
          });
        });
      });

      describe('when method pagination headers are true', () => {
        const method: Method = {
          type: MethodType.GET,
          pagination: {
            headers: true,
          },
        };

        it('returns the response data and sends metadata to headers', () => {
          const req = getMockReq({ query: { page: '0', size: '2' } });
          const res = getMockRes().res as Response;
          res.locals = {
            route: { path: '/users', methods: [method] },
            routeMethod: method,
            response: content,
          };

          middleware(req, res, next);
          expect(res.locals.response).toEqual(['Dog', 'Doogo']);
          expect(res.set).toHaveBeenCalled();
        });
      });
    });
  });
});
