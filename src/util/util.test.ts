import day from 'dayjs';
import cases from 'jest-in-case';
import jwt from 'jsonwebtoken';

import { JWT, TestObject } from '@util/constants';
import { now, take, verifyToken } from '@util/util';

test('now() - Returns UTC timestamp.', () => {
  const result: string = now();
  expect(result).toBe(day.utc().format());
  expect(day(result).isUTC()).toBe(true);
});

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
      output: 'three'
    }
  }
);

cases(
  `take(): Doesn't have truthy value.`,
  ({ input, output }: TestObject) => expect(take(input)).toBe(output),
  {
    'Has all falsy values.': {
      input: [
        [false, 'one'],
        [null, 'two'],
        [undefined, 'three']
      ],
      output: null
    },

    'Is empty array.': {
      input: [],
      output: null
    }
  }
);

cases(
  `verifyToken(): Token is verified.`,
  ({ input }: TestObject) => expect(verifyToken(input)).toBe(true),
  {
    'Is valid token': {
      input: jwt.sign({}, JWT.SECRET, { expiresIn: JWT.EXPIRES_IN })
    }
  }
);

cases(
  `verifyToken(): Token is not verified.`,
  ({ input }: TestObject) => expect(verifyToken(input)).toBe(false),
  {
    'Is JWT token, but signed with wrong signature.': {
      input: jwt.sign({}, 'hello-world', { expiresIn: JWT.EXPIRES_IN })
    },

    'Is not a JWT token.': { input: 'ramiAbdou' },

    'Is signed JWT token, but expired.': {
      input: jwt.sign({}, JWT.SECRET, { expiresIn: 0 })
    }
  }
);
