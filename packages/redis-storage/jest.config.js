module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./jest.setup.redis-mock.js'],
  testEnvironment: 'node',
};
