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
  {
    path: '/example/:uuid',
    methods: [
      {
        type: 'get',
        overrides: [
          {
            name: 'Custom',
            file: (req) => `data/example/${req.params.uuid}--custom.json`,
          },
        ],
      },
    ],
  },
]);

server.listen(8080);
