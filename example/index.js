const { createServer } = require('../build/index.js');

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
