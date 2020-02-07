import PaginationProperties from '../interfaces/PaginationProperties';
import ServerOptions from '../interfaces/ServerOptions';
import express from 'express';

function getPaginationProperties(options?: ServerOptions): PaginationProperties {
  const { pagination } = options || {};
  const { count, data, empty, first, last, page, pages, total } = pagination || {};

  return {
    count: count || 'count',
    data: data || 'data',
    empty: empty || 'empty',
    first: first || 'first',
    last: last || 'last',
    page: page || 'page',
    pages: pages || 'pages',
    total: total || 'total',
  };
}

/**
 * Create a paginated content.
 * 
 * @param {express.Request} req - 
 * @param {express.Response} res - 
 * @param {Array<any>} content - 
 * @param {ServerOptions} options - 
 */
export default function createPaginatedResponse(
  req: express.Request,
  res: express.Response,
  content: Array<any>,
  options?: ServerOptions,
) {
  const { query: { page: current = 1, size = 5 }, } = req;

  const { count, data, empty, first, last, page, pages, total } = getPaginationProperties(options);

  const currentPage = Number(current);
  const currentSize = Number(size);
  
  const totalElements = content.length;
  const totalPages = Math.ceil(totalElements / size);
  
  const offset = currentPage * currentSize;
  
  return {
    [data]: content.slice(offset, offset + currentSize),
    [empty]: content.slice(offset, offset + currentSize).length === 0,
    [first]: currentPage === 0,
    [last]: currentPage >= totalPages - 1,
    [page]: currentPage,
    [pages]: totalPages,
    [count]: currentSize,
    [total]: totalElements,
  };
}
