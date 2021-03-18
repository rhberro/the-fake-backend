import { ServerOptions, Pagination, PaginationProperties } from '../interfaces';
import { Middleware } from '../types';

function resolvePaginationProperties(
  routePagination: PaginationProperties | boolean,
  options: ServerOptions
): Pagination {
  const properties =
    typeof routePagination === 'boolean'
      ? options.pagination
      : { ...options.pagination, ...routePagination };

  return {
    count: properties?.count || 'count',
    data: properties?.data || 'data',
    empty: properties?.empty || 'empty',
    first: properties?.first || 'first',
    headers: properties?.headers || false,
    last: properties?.last || 'last',
    next: properties?.next || 'next',
    offsetParameter: properties?.offsetParameter || 'offset',
    page: properties?.page || 'page',
    pageParameter: properties?.pageParameter || 'page',
    pages: properties?.pages || 'pages',
    sizeParameter: properties?.sizeParameter || 'size',
    total: properties?.total || 'total',
  };
}

function createPaginatedResponse(
  properties: Pagination,
  query: any,
  response: any[]
) {
  const requestedSize = Number(query[properties.sizeParameter]) || 5;
  const requestedPage = query[properties.offsetParameter]
    ? Number(query[properties.offsetParameter]) / requestedSize
    : Number(query[properties.pageParameter]);

  const totalElements = response.length;
  const totalPages = Math.ceil(totalElements / requestedSize);
  const lastPage = totalPages - 1;

  const currentOffset = requestedPage * requestedSize;
  const currentPageData = response.slice(
    currentOffset,
    currentOffset + requestedSize
  );

  const metadata = {
    [properties.empty]: currentPageData.length === 0,
    [properties.first]: requestedPage === 0,
    [properties.last]: requestedPage >= lastPage,
    [properties.next]: requestedPage < lastPage,
    [properties.page]: requestedPage,
    [properties.pages]: totalPages,
    [properties.count]: requestedSize,
    [properties.total]: totalElements,
  };

  return {
    data: currentPageData,
    metadata,
  };
}

/**
 * Create a paginated content.
 *
 * @param req The request object
 * @param res The response object
 * @param content The content
 * @param method The route method
 * @param options The server options
 * @return The paginated content
 */
export default function createPaginatedRouteMiddleware(
  options: ServerOptions
): Middleware {
  return (req, res, next) => {
    const { query } = req;
    const { response, routeMethod } = res.locals;
    const { pagination } = routeMethod;

    if (pagination) {
      const properties = resolvePaginationProperties(pagination, options);
      const { data, metadata } = createPaginatedResponse(
        properties,
        query,
        response
      );

      if (properties.headers) {
        res.set(metadata);
        res.locals.response = data;
      } else {
        res.locals.response = {
          [properties.data]: data,
          ...metadata,
        };
      }
    }

    next();
  };
}
