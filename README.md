# the-fake-backend

Build a fake backend by providing the content of files or JavaScript objects through configurable routes. This service allows the developer to work on a new feature or an existing one using fake data while the real service is in development.

- [**Installing**](#installing)
- [**Getting Started**](#getting-started)

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

server.routes(
  [
    {
      path: '/example',
      methods: [
        {
          type: 'get',
          data: 'your-response-data-here',
        },
      ],
    },
  ]
);

server.listen(8080);
```

This will create the http://localhost:8080/example endpoint.
