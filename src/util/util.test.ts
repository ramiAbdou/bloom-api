import day from 'dayjs';
import cases from 'jest-in-case';
import jwt from 'jsonwebtoken';

import { JWT, TestObject } from '@util/constants';
import {
  buildUrl,
  decodeToken,
  now,
  signToken,
  splitArrayIntoChunks,
  take,
  verifyToken
} from '@util/util';

cases(
  'buildUrl()',
  ({ input, output }: TestObject) => {
    expect(output.includes(buildUrl(input))).toBe(true);
  },
  {
    'Has multiple params.': {
      input: { params: { code: 'xyz', token: 'abc' }, url: 'www.google.com' },
      output: [
        'www.google.com?token=abc&code=xyz',
        'www.google.com?code=xyz&token=abc'
      ]
    },

    'Has no params.': {
      input: { params: {}, url: 'www.google.com' },
      output: ['www.google.com']
    },

    'Has one param.': {
      input: { params: { token: 'abc' }, url: 'www.google.com' },
      output: ['www.google.com?token=abc']
    }
  }
);

cases(
  'decodeToken() - Is valid token.',
  ({ input, output }: TestObject) => {
    expect(decodeToken(input)).toHaveProperty('id', output);
  },
  {
    'Is valid token and does not expire.': {
      input: signToken({ expires: false, payload: { id: 1 } }),
      output: 1
    },

    'Is valid token and expires in 1 hour.': {
      input: signToken({ payload: { id: 1 } }),
      output: 1
    }
  }
);

cases(
  'decodeToken() - Is not a valid token.',
  ({ input }: TestObject) => {
    expect(decodeToken(input)).toBeNull();
  },
  {
    'Is JWT token, but signed with wrong signature.': {
      input: jwt.sign({}, 'hello-world')
    },

    'Is not a JWT token.': { input: 'ramiAbdou' },

    'Is signed JWT token, but expired.': {
      input: jwt.sign({}, JWT.SECRET, { expiresIn: 0 })
    }
  }
);

test('now() - Returns current UTC timestamp.', () => {
  const result: string = now();
  expect(result).toBe(day.utc().format());
});

cases(
  'splitArrayIntoChunks()',
  ({ input, output }: TestObject) => {
    expect(splitArrayIntoChunks(input)).toEqual(output);
  },
  {
    'Has chunk size of 1.': {
      input: { arr: [1, 2, 3, 4, 5], maxChunkSize: 1 },
      output: [[1], [2], [3], [4], [5]]
    },

    'Has less elements than max chunk size.': {
      input: { arr: [1, 2, 3, 4, 5], maxChunkSize: 10 },
      output: [[1, 2, 3, 4, 5]]
    },

    'Has more elements than max chunk size.': {
      input: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], maxChunkSize: 5 },
      output: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10]
      ]
    },

    'Has no elements.': {
      input: { arr: [], maxChunkSize: 10 },
      output: [[]]
    }
  }
);

cases(
  'take(): Has truthy value.',
  ({ input, output }: TestObject) => {
    expect(take(input)).toBe(output);
  },
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
  ({ input, output }: TestObject) => {
    expect(take(input)).toBe(output);
  },
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
  ({ input }: TestObject) => {
    expect(verifyToken(input)).toBe(true);
  },
  {
    'Is valid token and does not expire.': {
      input: signToken({ expires: false, payload: {} })
    },

    'Is valid token and expires.': {
      input: signToken({ payload: {} })
    }
  }
);

cases(
  `verifyToken(): Token is not verified.`,
  ({ input }: TestObject) => {
    expect(verifyToken(input)).toBe(false);
  },
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
