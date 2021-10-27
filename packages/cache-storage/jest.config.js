module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
  coverageReporters: ['text', 'text-summary'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
