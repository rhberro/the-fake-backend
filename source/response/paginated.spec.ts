import createPaginatedResponse from './paginated';
import { Method, ServerOptions } from '../interfaces';
import { MethodType } from '../enums';
import { getMockReq, getMockRes } from '@jest-mock/express';

describe('source/response/paginated.ts', () => {
  describe('createPaginatedResponse', () => {
    const content = ['Dog', 'Doogo', 'Dogger', 'Doggernaut', 'Dogging'];
    const { res } = getMockRes();

    describe('when server has default pagination options', () => {
      const serverOptions: ServerOptions = {
        proxies: [],
        throttlings: [],
      };

      describe('when method uses default pagination options', () => {
        const method: Method = {
          type: MethodType.GET,
          pagination: true,
        };

        it('creates a paginated response object with data and metadata', () => {
          const req = getMockReq();
          const response: any = createPaginatedResponse(
            req,
            res,
            content,
            method,
            serverOptions
          );

          expect(response).toBeInstanceOf(Object);
        });

        describe('when using page/size query parameters', () => {
          const req = getMockReq({ query: { page: '0', size: '2' } });

          it('creates a paginated response object with data and metadata', () => {
            const response: any = createPaginatedResponse(
              req,
              res,
              content,
              method,
              serverOptions
            );

            expect(response.data).toEqual(['Dog', 'Doogo']);
          });
        });

        describe('when using offset/size query parameters', () => {
          const req = getMockReq({ query: { offset: '2', size: '2' } });

          it('slices from offset', () => {
            const response: any = createPaginatedResponse(
              req,
              res,
              content,
              method,
              serverOptions
            );

            expect(response.data).toEqual(['Dogger', 'Doggernaut']);
          });
        });

        describe('when size query parameter is missing', () => {
          const req = getMockReq({ query: { offset: '0' } });

          it('uses the default page size', () => {
            const response: any = createPaginatedResponse(
              req,
              res,
              content,
              method,
              serverOptions
            );

            expect(response.data).toHaveLength(5);
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
          const response = createPaginatedResponse(
            req,
            res,
            content,
            method,
            serverOptions
          );

          expect(response).toEqual(['Dog', 'Doogo']);
          expect(res.set).toHaveBeenCalled();
        });
      });
    });
  });
});
