# the-fake-backend

![build](https://github.com/rhberro/the-fake-backend/workflows/build/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/rhberro/the-fake-backend/badge.svg?branch=master)](https://coveralls.io/github/rhberro/the-fake-backend?branch=master)
[![NPM Version](https://img.shields.io/npm/v/the-fake-backend.svg?style=flat)](https://www.npmjs.com/package/the-fake-backend)
[![NPM Downloads](https://img.shields.io/npm/dm/the-fake-backend.svg?style=flat)](https://npmcharts.com/compare/the-fake-backend?minimal=true)
[![Publish Size](https://badgen.net/packagephobia/publish/the-fake-backend)](https://packagephobia.now.sh/result?p=the-fake-backend)

Build a fake backend by providing the content of files or JavaScript objects through configurable routes. This service allows the developer to work on a new feature or an existing one using fake data while the real service is in development.

- [**Installing**](#installing)
- [**Getting Started**](#getting-started)
  - [**Files**](#files)
- [**Properties**](#properties)
  - [**Server**](#server)
    - [**Throttlings**](#throttlings)
    - [**Pagination**](#pagination)
  - [**Routes**](#routes)
    - [**Methods**](#methods)
    - [**Search**](#search)
    - [**Overrides**](#overrides)
- [**GraphQL**](#graphql)
  - [**Queries**](#queries)
  - [**Mutations**](#mutations)
- [**Guides**](#guides)
  - [**Overriding responses**](#overriding-responses)
  - [**Overriding response content**](#overriding-response-content)
  - [**Searching**](#searching)
  - [**Paginating**](#paginating)
  - [**Dynamic params requests**](#dynamic-params-requests)
- [**Contributing**](#contributing)
  - [**Setup library**](#setup-library)
  - [**Example application**](#example-application)

## Installing

Start by adding the service as a development dependency.

```
yarn add --dev the-fake-backend
```

or

```
npm install --save-dev the-fake-backend
```

## Getting Started

After installing, create a new file that will be responsible for configuring and starting the service.

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes([
  {
    path: '/example',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        data: 'your-response-data-here',
        // data: (req) => 'your-response-data-here-based-in-request'
      },
    ],
  },
]);

server.listen(8080);
```

This will create the http://localhost:8080/example endpoint.

### Files

You can also use files content as response instead of using the `data` property.

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes([
  {
    path: '/cats',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
      },
    ],
  },
  {
    path: '/dogs',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        file: 'data/my/custom/path/to/dogs.txt',
        // file: req => `data/my/custom/path/to/dogs-${req.query.type}.txt`
      },
    ],
  },
]);

server.listen(8080);
```

The script above generates the following two endpoints.

| Method | Path                       | Response                                           |
| ------ | -------------------------- | -------------------------------------------------- |
| GET    | http://localhost:8080/cats | The `data/cats.json` file content                  |
| GET    | http://localhost:8080/dogs | The `data/my/custom/path/to/dogs.txt` file content |

## Properties

### Server

| Property                    | Required | Description                                                                                 |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| basePath                    | no       | An API context prefix (e.g. `/v1`)                                                          |
| middlewares                 | no       | An array of [express's middlewares](https://expressjs.com/en/guide/writing-middleware.html) |
| [proxies](#proxies)         | no       | The server proxies                                                                          |
| [throttlings](#throttlings) | no       | The server throttlings                                                                      |
| [pagination](#pagination)   | no       | The server pagination setup                                                                 |
| docsRoute                   | no       | The route that will print all the routes as HTML                                            |
| definitions                 | no       | The GraphQL definitions.                                                                    |

#### Proxies

This property allows to proxy requests.

| Property                 | Required | Default | Description                                                                                                                         |
| ------------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| proxies[].name           | yes      |         | The proxy name                                                                                                                      |
| proxies[].host           | yes      |         | The proxy host (e.g.: `http://api.dev.com/api`)                                                                                     |
| proxies[].appendBasePath | No       | `false` | Whether `basePath` should be appended in target                                                                                     |
| proxies[].onProxyReq     | No       |         | A proxy request handler to forward to [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#http-proxy-events)  |
| proxies[].onProxyRes     | No       |         | A proxy response handler to forward to [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#http-proxy-events) |

#### Throttlings

This property allows responses to be throttled.

| Property             | Required | Description                                       |
| -------------------- | -------- | ------------------------------------------------- |
| throttlings[].name   | yes      | Custom throttling name                            |
| throttlings[].values | yes      | Custom throttling range (array of numbers, in ms) |

#### Pagination

This property allows routes to be paginated. Response attributes may be printed in response payload (wrapping the given fixture) or headers. Request parameters are read from URL query string.

| Property        | Required | Default    | Type               | Description                                            |
| --------------- | -------- | ---------- | ------------------ | ------------------------------------------------------ |
| count           | no       | `'count'`  | Response attribute | Current page items count                               |
| data            | no       | `'data'`   | Response attribute | Current page data                                      |
| empty           | no       | `'empty'`  | Response attribute | Whether if current page is empty                       |
| first           | no       | `'first'`  | Response attribute | Whether if current page is the first one               |
| headers         | no       | `false`    | Configuration      | Whether response attributes will be present in headers |
| last            | no       | `'last'`   | Response attribute | Whether if current page is the last one                |
| next            | no       | `'next'`   | Response attribute | Whether if there is a next page                        |
| offsetParameter | no       | `'offset'` | Request parameter  | Requested offset                                       |
| page            | no       | `'page'`   | Response attribute | Current page                                           |
| pageParameter   | no       | `'page'`   | Request parameter  | Requested page                                         |
| pages           | no       | `'pages'`  | Response attribute | Pages count                                            |
| sizeParameter   | no       | `'size'`   | Request parameter  | Requested page size                                    |
| total           | no       | `'total'`  | Response attribute | Total items count                                      |

### Routes

| Property                     | Required | Description                                                   |
| ---------------------------- | -------- | ------------------------------------------------------------- |
| routes[].path                | yes      | The endpoint address (URI).                                   |
| [routes[].methods](#methods) | yes      | The route methods, check the method's properties table below. |

#### Methods

| Property                            | Type                      | Required | Default             | Description                                                                                   |
| ----------------------------------- | ------------------------- | -------- | ------------------- | --------------------------------------------------------------------------------------------- |
| methods[].type                      | string                    | yes      |                     | HTTP request type                                                                             |
| methods[].code                      | number                    | no       | `200`               | HTTP response status code                                                                     |
| methods[].data                      | any \| (req) => any       | no       |                     | HTTP response data. May also be a function with request                                       |
| methods[].file                      | string \| (req) => string | no       | `/data/${req.path}` | HTTP response data fixture file (when data is not given). May also be a function with request |
| methods[].headers                   | object \| (req) => object | no       |                     | HTTP response headers. May also be a function with request                                    |
| methods[].delay                     | number                    | no       |                     | HTTP response delay/timeout, in milliseconds                                                  |
| [methods[].search](#search)         | object                    | no       |                     | Search parameters                                                                             |
| [methods[].pagination](#pagination) | boolean \| object         | no       | `false`             | Whether data is paginated or not. May also be a pagination object                             |
| [methods[].overrides](#overrides)   | object[]                  | no       |                     | Custom response scenarios (switchable in CLI)                                                 |
| methods[].overrideContent           | (req, content) => any     | no       |                     | A function to override response content before send                                           |

#### Search

This property allows routes to be searchable.

| Property   | Type     | Required | Default    | Description                                |
| ---------- | -------- | -------- | ---------- | ------------------------------------------ |
| parameter  | string   | yes      | `'search'` | Query string parameter name                |
| properties | string[] | yes      |            | An array of properties to apply the search |

#### Overrides

This property allows you to create an array of options that will override the current `method` option.

| Property                    | Type                      | Required | Default | Description     |
| --------------------------- | ------------------------- | -------- | ------- | --------------- |
| overrides[].name            | string                    | yes      |         | Scenario name   |
| overrides[].code            | number                    | no       | `200`   | Described above |
| overrides[].data            | any \| (req) => any       | no       |         | Described above |
| overrides[].file            | string \| (req) => string | no       |         | Described above |
| overrides[].headers         | object \| (req) => object | no       |         | Described above |
| overrides[].delay           | number                    | no       |         | Described above |
| overrides[].search          | object                    | no       |         | Described above |
| overrides[].pagination      | boolean \| object         | no       | `false` | Described above |
| overrides[].overrideContent | (req, content) => any     | no       |         | Described above |
| overrides[].selected        | boolean                   | no       | `false` | Described above |

## GraphQL

We're using [apollo-server-express](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-express) to integrate the GraphQL Server to the `the-fake-backend`. When you have the `definitions` property, the server will enable the GraphQL's related endpoints.

| Method | Path                          | Response                                         |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | http://localhost:8080/graphql | The graphical interactive in-browser GraphQL IDE |
| POST   | http://localhost:8080/graphql | The queries and mutations response               |

### Queries

The service searches for a JSON file inside the `graphl/queries/` folder using the query name, for example, the query below tries to respond with the `graphl/queries/getPerson.json` file's content.

```javascript
const { createServer } = require('the-fake-backend');

const serverOptions = {
  definitions: `
    type Person {
      id: String
      name: String
      age: Int
    }

    type Query {
      getPerson(id: String): Person
    }
  `,
};

const server = createServer(serverOptions);

server.listen(8080);
```

### Mutations

The same happens to the mutations, for example, the mutation below tries to respond with the `graphl/mutations/createPerson.json` file's content.

```javascript
const { createServer } = require('the-fake-backend');

const serverOptions = {
  definitions: `
    type Person {
      id: String
      name: String
      age: Int
    }

    input PersonInput {
      name: String
      age: Int
    }

    type Mutation {
      createPerson(person: PersonInput): Person
    }
  `,
};

const server = createServer(serverOptions);

server.listen(8080);
```

> The GraphQL's endpoints does not have support for throttlings, proxies, pagination, overridings and search at the moment, we are still working on these features.

## Guides

### Overriding responses

When a request is made the server will check if the `method` object contains the `overrides` property and if there is one `override` selected through the property `selected`. If there is an `override` selected it will be merged with the `method` object.

#### Example

```javascript
const server = createServer({ ... })

server.routes([
  {
    path: '/user',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        file: 'data/my/custom/path/to/client-user.json',
        overrides: [
          {
            name: 'Staff',
            file: 'data/my/custom/path/to/staff-user.json'
          },
          {
            name: 'Super Admin',
            file: 'data/my/custom/path/to/super-admin-user.json'
          },
          {
            name: 'Error 500',
            code: 500
          }
        ]
      }
    ]
  }
]);

// curl -XGET http://localhost:8080/user
// Returns `data/my/custom/path/to/client-user.json` file content.

Press 'o' on terminal and change the URL '/user' with method 'get' with override 'Super Admin'

// curl -XGET http://localhost:8080/user
// Returns `data/my/custom/path/to/super-admin-user.json` file content.
```

### Overriding response content

You can override the response content after all the processing (file/data content, pagination, search, etc.).

### Example

```json
// /data/dogs.json
[
  { "id": 1, "name": "Doogo" },
  { "id": 2, "name": "Dogger" },
  { "id": 3, "name": "Dog" },
  { "id": 4, "name": "Doggernaut" },
  { "id": 5, "name": "Dogging" }
]
```

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes([
  {
    path: '/dogs',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        overrideContent: (req, content) => ({
          ...content,
          { id: 6, name: 'Bulldog' }
        })
      },
    ],
  },
]);

server.listen(8080);
```

### Searching

You can make an endpoint searchable by declaring the search property in a route.

#### Example

```json
// /data/dogs.json
[
  { "id": 1, "name": "Doogo" },
  { "id": 2, "name": "Dogger" },
  { "id": 3, "name": "Dog" },
  { "id": 4, "name": "Doggernaut" },
  { "id": 5, "name": "Dogging" }
]
```

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes([
  {
    path: '/dogs',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        search: {
          parameter: 'search',
          properties: ['name'],
        },
      },
    ],
  },
]);

server.listen(8080);
```

You can now make requests to the `http://localhost:8080/dogs?search=dogg` endpoint. The response will be the `data/dogs.json` file content filtered.

```json
[
  { "id": 2, "name": "Dogger" },
  { "id": 4, "name": "Doggernaut" },
  { "id": 5, "name": "Dogging" }
]
```

### Paginating

You can make an endpoint paginated by declaring the pagination options in the server (just in case of overriding default values), adding pagination parameter in a route and visiting it with pagination query string parameters.

Route pagination parameter may be a boolean (true) to use global pagination options, or [pagination](#pagination) object parts to override global ones.

> Note: The pagination is zero-based, so 0 is the first page.

#### Example

```json
// /data/dogs.json
[
  { "id": 1, "name": "Doogo" },
  { "id": 2, "name": "Dogger" },
  { "id": 3, "name": "Dog" },
  { "id": 4, "name": "Doggernaut" },
  { "id": 5, "name": "Dogging" }
];
```

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer(); // if pagination isn't given, default values will be applied

server.routes([
  {
    path: '/dogs',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
        pagination: true,
        // pagination: { headers: true } // only this request will have pagination parameters in response headers
      },
    ],
  },
]);

server.listen(8080);
```

Then, given a `http://localhost:8080/dogs?page=1&size=2` request, the following payload will be returned:

```json
{
  "count": 2,
  "empty": false,
  "first": true,
  "last": false,
  "next": true,
  "page": 1,
  "pages": 3,
  "total": 5,
  "data": [
    { "id": 3, "name": "Dog" },
    { "id": 4, "name": "Doggernaut" }
  ]
}
```

> Note: given `http://localhost:8080/dogs?offset=2&size=2` the payload would be the same. Offset attribute has precedence over page.

If headers attribute was set to true in server options (or route pagination options):

```javascript
const server = createServer({
  pagination: {
    headers: true,
  },
});
```

Then the metadata attributes would be printed in response headers and the response payload would be the following:

```json
[
  { "id": 3, "name": "Dog" },
  { "id": 4, "name": "Doggernaut" }
]
```

### Dynamic params requests

Just like in Express, route requests may have dynamic params:

```javascript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes([
  {
    path: '/dogs/:id/details',
    methods: [
      {
        type: 'get', // or MethodType.GET with Typescript
      },
    ],
  },
]);
```

Given a matching HTTP request, e.g. `http://localhost:8080/dogs/3/details`, the server will search the following fixtures, sorted by precedence:

1. `data/dogs/3/details.json`
2. `data/dogs/:id/details.json`

If the request has multiple dynamic params, the precedence is the same, searching the fullly specific fixture, and the fully generic one otherwise.

## Contributing

### Setup library

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start rollup in watch mode
4. Have fun!

### Example application

This repository already have an example application that already install last built version from `the-fake-backend` before run.

To start this application:

1. Go to `example` folder
2. Run `npm install` to install dependencies
3. Run `npm start` to start example application
