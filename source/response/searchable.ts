import { Search, Middleware } from '../interfaces';

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
  const { parameter, properties } = search;

  return properties.find((property) =>
    filterProperty(query, item, parameter, property)
  );
}

function createSearchableResponse(
  routeSearch: Search,
  query: any,
  response: any[]
) {
  return response.filter((item) => filterContent(routeSearch, query, item));
}

/**
 * Create a middleware that filters the content using the search properties.
 */
export default function createSearchableMiddleware(): Middleware {
  return (req, res, next) => {
    const { query } = req;
    const { response, routeMethod } = res.locals;
    const { search, search: { parameter = 'search' } = {} } = routeMethod;
    const hasParameterOnQuery = query[parameter];

    if (search && hasParameterOnQuery) {
      res.locals.response = createSearchableResponse(search, query, response);
    }

    next();
  };
}
