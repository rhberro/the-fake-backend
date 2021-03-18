import { getMockReq, getMockRes } from '@jest-mock/express';

import { Method, Response } from '../interfaces';
import { MethodType } from '../enums';
import createSearchableRouteMiddleware from './searchable';

describe('source/response/searchable.ts', () => {
  describe('createSearchableMiddleware', () => {
    const content = [
      { name: 'Dog', age: 1 },
      { name: 'Doogo', age: 2 },
      { name: 'Dogger', age: 3 },
      { name: 'Doggernaut', age: 4 },
      { name: 'Dogging', age: 5 },
    ];
    const res = getMockRes().res as Response;
    const middleware = createSearchableRouteMiddleware();
    const next = jest.fn();

    describe('when method is searchable', () => {
      const method: Method = {
        type: MethodType.GET,
        search: {
          parameter: 'name',
          properties: ['name'],
        },
      };

      beforeEach(() => {
        res.locals = {
          route: { path: '/users', methods: [method] },
          routeMethod: method,
          response: content,
        };
      });

      describe('when the search query parameter is present', () => {
        const req = getMockReq({ query: { name: 'Dogg' } });

        it('returns the matching content', () => {
          middleware(req, res, next);
          expect(res.locals.response).toEqual([
            { name: 'Dogger', age: 3 },
            { name: 'Doggernaut', age: 4 },
            { name: 'Dogging', age: 5 },
          ]);
        });
      });

      describe('when the search query parameter is not present', () => {
        const req = getMockReq();

        it('returns all the content', () => {
          middleware(req, res, next);
          expect(res.locals.response).toHaveLength(5);
        });
      });
    });
  });
});
