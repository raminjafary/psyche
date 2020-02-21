module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '\\.s?css$':
      'identity-obj-proxy' || require.resolve('./__tests__/mocks/style-mock.ts')
  },
  testPathIgnorePatterns: [
    '<rootDir>/(dist|node_modules|types|__tests__/mocks|__tests__/coverage)/'
  ],
  coverageDirectory: '__tests__/coverage',
  collectCoverageFrom: ['src/**/*.{ts,js}', 'examples/**/*.{ts,js}'],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 24,
      functions: 17,
      lines: 12
    }
  }
}
