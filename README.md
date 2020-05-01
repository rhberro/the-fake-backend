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
  - [**Routes**](#routes)
  - [**Methods**](#methods)
  - [**Overrides**](#overrides)
- [**Searching**](#searching)

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
        data: 'you-response-data-here',
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
      },
    ],
  },
]);

server.listen(8080);
```

The script above generates the following two endpoints.

| Method | Path                       | Response                                            |
| ------ | -------------------------- | --------------------------------------------------- |
| GET    | http://localhost:8080/cats | The `data/cats.json` file content.                  |
| GET    | http://localhost:8080/dogs | The `data/my/custom/path/to/dogs.txt` file content. |

## Properties

### Server

| Property    | Required | Description                                                                                                            |
| ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| middlewares | no       | An array of functions compatible with [express's middlewares](https://expressjs.com/en/guide/writing-middleware.html). |
| proxies     | no       | The server proxies.                                                                                                    |
| throttlings | no       | The server throttlings.                                                                                                |

### Routes

| Property | Required | Description                                                   |
| -------- | -------- | ------------------------------------------------------------- |
| path     | yes      | The endpoint address (URI).                                   |
| method   | yes      | The route methods, check the method's properties table below. |

### Methods

| Property  | Required | Default |
| --------- | -------- | ------- |
| type      | yes      |         |
| code      | no       | 200     |
| data      | no       |         |
| file      | no       |         |
| headers   | no       |         |
| search    | no       |         |
| paginated | no       | false   |
| overrides | no       |         |

### Overrides

The same [Methods](#methods) properties but requires a `name` and does not have `type` and `overrides` properties.

| Property  | Required | Default |
| --------- | -------- | ------- |
| name      | yes      |         |
| code      | no       | 200     |
| data      | no       |         |
| file      | no       |         |
| headers   | no       |         |
| search    | no       |         |
| paginated | no       | false   |
| selected  | no       | false   |

This property allows you to create an array of options that will override the current `method` option.

When a request is made the server will check if the `method` object contains the `overrides` property and if there is one `override` selected through the property `selected`. If there is an `override` selected it will be merged with the `method` object.

For example:

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

Press 'o' on terminal and change the URl '/user' with method 'get' with override 'Super Admin'

// curl -XGET http://localhost:8080/user
// Returns `data/my/custom/path/to/super-admin-user.json` file content.
```

## Searching

You can make an endpoint searchable by declaring the search property.

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
