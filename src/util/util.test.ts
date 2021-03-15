import cases from 'jest-in-case';

import { TestObject } from './constants';
import { take } from './util';

interface TestCasesObject {
  input: any;
  output: any;
}

cases(
  'take(): Has truthy value.',
  ({ input, output }: TestObject) => expect(take(input)).toBe(output),
  {
    'Has multiple truthy values.': {
      input: [
        [true, 'one'],
        [true, 'two'],
        [true, 'three']
      ],
      output: 'one'
    },

    'Only first value is truthy.': {
      input: [
        [true, 'one'],
        [false, 'two'],
        [false, 'three']
      ],
      output: 'one'
    },

    'Only last value is truthy.': {
      input: [
        [false, 'one'],
        [false, 'two'],
        [true, 'three']
      ],
      output: 'one'
    }
  }
);

cases(
  `take(): Doesn't have truthy value.`,
  ({ input, output }: TestCasesObject) => expect(take(input)).toBe(output),
  {
    'Has all falsy values.': {
      input: [
        [false, 'one'],
        [false, 'two'],
        [false, 'three']
      ],
      output: null
    },

    'Is empty array.': {
      input: [],
      output: null
    }
  }
);
