const { createServer } = require('../build/index');

const server = createServer();

server.routes([
  {
    path: '/example',
    methods: [
      {
        type: 'get',
      },
    ],
  },
]);

server.listen(8080);
