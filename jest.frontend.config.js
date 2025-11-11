const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/githubworkflow/frontend/**/*.test.ts?(x)',
    '<rootDir>/githubworkflow/frontend/**/*.spec.ts?(x)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
    '!src/types/**',
    'githubworkflow/frontend/**/*.{ts,tsx}',
  ],
  coverageDirectory: 'coverage/frontend',
}

module.exports = createJestConfig(customJestConfig)

