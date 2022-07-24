import type { Config } from '@jest/types';

const common: Config.InitialOptions = {
  transform: { '^.+\\.tsx?$': '@swc/jest' },
  roots: ['<rootDir>/src'],
  moduleNameMapper: { '~/(.*)': '<rootDir>/src/$1' },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  modulePathIgnorePatterns: ['__fixtures__', '__snapshots__'],
  clearMocks: true,
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: 'Backend',
      rootDir: './backend',
      ...common,
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: ['**/constructs/Cognito/lambdaTriggers/**'],
  coveragePathIgnorePatterns: ['.*__snapshots__/.*'],
  coverageReporters: [['text', { skipFull: true }]],
};

export default config;
