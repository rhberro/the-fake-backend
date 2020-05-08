import express from 'express';

import { Method, Search } from '../interfaces';

function filterProperty(
  query: any,
  item: any,
  parameter: string,
  property: string
) {
  return (
    item[property] &&
    item[property].toLowerCase().includes(query[parameter].toLowerCase())
  );
}

function filterContent(search: Search, query: any, item: any) {
  const filterPropertyBinded = filterProperty.bind(
    null,
    query,
    item,
    search.parameter
  );
  return search.properties.filter(filterPropertyBinded).length;
}

/**
 * Filters the content using the search properties and returns a filtered content.
 *
 * @param req The request object
 * @param res The response object
 * @param content The content
 * @param method The route method
 */
export default function createSearchableResponse(
  req: express.Request,
  res: express.Response,
  content: Array<any>,
  method: Method
) {
  const { search, search: { parameter = 'search' } = {} } = method;
  const { query } = req;

  const bindedFilterContent = filterContent.bind(null, search, query);

  return !query[parameter] ? content : content.filter(bindedFilterContent);
}
