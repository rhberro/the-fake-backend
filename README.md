# the-fake-backend

This service allows the developer to work on a new feature or an existing one using fake data while the real service is in development.

* [**Installing**](#installing)
* [**Getting Started**](#getting-started)

## Installing

Start by adding the service as a development dependency:

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
const { createServer, Server } = require('the-fake-backend');

const server: Server = createServer();

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
