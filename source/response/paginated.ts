import {
  PaginationProperties,
  ServerOptions,
  Method,
  ResolvedPaginationProperties,
} from '../interfaces';

import express from 'express';

function getPaginationProperties(
  properties?: PaginationProperties
): ResolvedPaginationProperties {
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

/**
 * Create a paginated content.
 *
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {Array<any>} content Content
 * @param {ServerOptions} options Server options
 */
export default function createPaginatedResponse(
  req: express.Request,
  res: express.Response,
  content: Array<any>,
  method: Method,
  options: ServerOptions
) {
  const { query } = req;
  const properties =
    typeof method.pagination === 'boolean'
      ? options.pagination
      : { ...options.pagination, ...method.pagination };

  const {
    count,
    data,
    empty,
    first,
    headers,
    last,
    next,
    offsetParameter,
    pageParameter,
    page,
    pages,
    sizeParameter,
    total,
  } = getPaginationProperties(properties);

  const requestedSize = Number(query[sizeParameter]) || 5;
  const requestedPage = query[offsetParameter]
    ? Number(query[offsetParameter]) / requestedSize
    : Number(query[pageParameter]);

  const totalElements = content.length;
  const totalPages = Math.ceil(totalElements / requestedSize);
  const lastPage = totalPages - 1;

  const currentOffset = requestedPage * requestedSize;
  const currentPageData = content.slice(
    currentOffset,
    currentOffset + requestedSize
  );

  const currentMetadata = {
    [empty]: currentPageData.length === 0,
    [first]: requestedPage === 0,
    [last]: requestedPage >= lastPage,
    [next]: requestedPage < lastPage,
    [page]: requestedPage,
    [pages]: totalPages,
    [count]: requestedSize,
    [total]: totalElements,
  };

  if (headers) {
    res.set(currentMetadata);

    return currentPageData;
  }

  return {
    [data]: currentPageData,
    ...currentMetadata,
  };
}
