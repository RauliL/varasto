module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./jest.setup.redis-mock.js'],
  testEnvironment: 'node',
};
