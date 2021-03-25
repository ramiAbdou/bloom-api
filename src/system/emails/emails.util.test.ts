/**
 * @group unit
 */

import cases from 'jest-in-case';

import { TestObject } from '@util/constants';
import { stringifyEmailTimestamp } from './emails.util';

cases(
  'stringifyEmailTimestamp()',
  ({ input, output }: TestObject<string, string>) => {
    expect(stringifyEmailTimestamp(input)).toBe(output);
  },
  {
    'Should be local PDT or PST timestamp.': {
      input: '2021-03-25T23:00:00Z',
      output: 'March 25, 2021 @ 4:00 PM PDT'
    }
  }
);
