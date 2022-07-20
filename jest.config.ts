import type { Config } from '@jest/types';

const common: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: { '^.+\\.tsx?$': '@swc/jest' },
  resetMocks: true,
};

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: 'Backend',
      rootDir: './backend',
      ...common,
    },
  ],
};

export default config;
