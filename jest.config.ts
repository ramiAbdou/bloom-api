import { pathsToModuleNameMapper } from 'ts-jest/utils';

import { Config as JestConfig } from '@jest/types';
import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfig.InitialOptions = {
  collectCoverageFrom: ['**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['.test.ts', 'constants.*.ts'],
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
  },
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  }),
  preset: 'ts-jest',
  setupFilesAfterEnv: ['jest-extended', './jest.setup.ts'],
  testEnvironment: 'node'
};

export default jestConfig;
