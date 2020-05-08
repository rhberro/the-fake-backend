import createSearchableResponse from './searchable';
import { Method } from '../interfaces';
import { MethodType } from '../enums';
import { getMockReq, getMockRes } from '@jest-mock/express';

describe('source/response/searchable.ts', () => {
  describe('createSearchableResponse', () => {
    const content = [
      { name: 'Dog', age: 1 },
      { name: 'Doogo', age: 2 },
      { name: 'Dogger', age: 3 },
      { name: 'Doggernaut', age: 4 },
      { name: 'Dogging', age: 5 },
    ];
    const { res } = getMockRes();

    describe('when method is searchable', () => {
      const method: Method = {
        type: MethodType.GET,
        search: {
          parameter: 'name',
          properties: ['name'],
        },
      };

      describe('when the search query parameter is present', () => {
        const req = getMockReq({ query: { name: 'Dogg' } });

        it('returns the matching content', () => {
          const response: any = createSearchableResponse(
            req,
            res,
            content,
            method
          );

          expect(response).toEqual([
            { name: 'Dogger', age: 3 },
            { name: 'Doggernaut', age: 4 },
            { name: 'Dogging', age: 5 },
          ]);
        });
      });

      describe('when the search query parameter is not present', () => {
        const req = getMockReq();

        it('returns all the content', () => {
          const response: any = createSearchableResponse(
            req,
            res,
            content,
            method
          );

          expect(response).toHaveLength(5);
        });
      });
    });
  });
});
