# the-fake-backend

![build](https://github.com/rhberro/the-fake-backend/workflows/build/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/rhberro/the-fake-backend/badge.svg?branch=master)](https://coveralls.io/github/rhberro/the-fake-backend?branch=master)
[![NPM Version](https://img.shields.io/npm/v/the-fake-backend.svg?style=flat)](https://www.npmjs.com/package/the-fake-backend)
[![NPM Downloads](https://img.shields.io/npm/dm/the-fake-backend.svg?style=flat)](https://npmcharts.com/compare/the-fake-backend?minimal=true)
[![Publish Size](https://badgen.net/packagephobia/publish/the-fake-backend)](https://packagephobia.now.sh/result?p=the-fake-backend)

Build a fake backend by providing the content of files or JavaScript objects through configurable routes. This service allows the developer to work on a new feature or an existing one using fake data while the real service is in development.

* [**Installing**](#installing)
* [**Getting Started**](#getting-started)

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

```typescript
const { createServer } = require('the-fake-backend');

const server = createServer();

server.routes(
  [
    {
      path: '/example',
      methods: [
        {
          type: 'get',
          data: 'you-response-data-here',
        },
      ],
    },
  ]
);

server.listen(8080);
```
