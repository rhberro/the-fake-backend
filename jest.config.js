module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['source/**/*'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
