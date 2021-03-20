import { pathsToModuleNameMapper } from 'ts-jest/utils';

import { Config as JestConfig } from '@jest/types';
import { compilerOptions } from './tsconfig.json';

const coverageOptions: Partial<JestConfig.InitialOptions> = {
  collectCoverageFrom: ['**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['.test.ts', '.types.ts', 'constants.*.ts'],
  coverageThreshold: {
    // @ts-ignore b/c we're allowed to specify custom paths.
    './src/util/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
    // TODO: When tests are added everywhere, uncomment this line.
    // global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};

const mockOptions: Partial<JestConfig.InitialOptions> = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};

const jestConfig: JestConfig.InitialOptions = {
  ...coverageOptions,
  ...mockOptions,
  // Ensures that we run in a single thread so that tests don't affect each
  // other.
  maxConcurrency: 1,
  maxWorkers: 1,
  // For some reason, jest requires that we still have .js files.
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  }),
  preset: 'ts-jest',
  runner: 'groups',
  setupFilesAfterEnv: ['jest-chain', './jest.setup.ts'],
  testEnvironment: 'node'
};

export default jestConfig;
