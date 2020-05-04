import { PaginationProperties, ServerOptions } from '../interfaces';

import express from 'express';

function getPaginationProperties(
  options?: ServerOptions
): PaginationProperties {
  const pagination = options?.pagination;

  return {
    count: pagination?.count || 'count',
    data: pagination?.data || 'data',
    empty: pagination?.empty || 'empty',
    first: pagination?.first || 'first',
    headers: pagination?.headers || false,
    last: pagination?.last || 'last',
    next: pagination?.next || 'next',
    offsetParameter: pagination?.offsetParameter || 'offset',
    page: pagination?.page || 'page',
    pageParameter: pagination?.pageParameter || 'page',
    pages: pagination?.pages || 'pages',
    sizeParameter: pagination?.sizeParameter || 'size',
    total: pagination?.total || 'total',
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
  options?: ServerOptions
) {
  const { query } = req;
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
  } = getPaginationProperties(options);

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
