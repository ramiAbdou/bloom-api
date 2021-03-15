import { Config as JestConfig } from '@jest/types';

const jestConfig: JestConfig.InitialOptions = {
  collectCoverageFrom: ['**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['.test.ts'],
  coverageThreshold: {
    // @ts-ignore b/c we're allowed to specify custom paths.
    './src/util/util.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
    // TODO: When tests are added everywhere, uncomment this line.
    // global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node'
};

export default jestConfig;
