import express from 'express';
import cases from 'jest-in-case';

import * as refreshTokenFlow from '@entities/user/repo/refreshToken';
import { TestObject } from '@util/constants';
import { signToken } from '@util/util';
import refreshTokenIfExpired from './refreshTokenIfExpired';

type RefreshTokenIfExpiredInput = Pick<express.Request, 'cookies' | 'url'>;

cases(
  `refreshTokenIfExpired() - Should refresh the token.`,
  async ({ input }: TestObject<RefreshTokenIfExpiredInput>) => {
    const req = { cookies: input.cookies, url: input.url } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    const mockedRefreshTokenFlow = jest
      .spyOn(refreshTokenFlow, 'default')
      .mockImplementation(async () => {
        return { accessToken: 'abc', refreshToken: 'cde' };
      });

    await refreshTokenIfExpired(req, res, next);

    // Expect statements.
    expect(next).toBeCalled();
    expect(mockedRefreshTokenFlow).toBeCalled();
    expect(req.cookies.accessToken).toBe('abc');
    expect(req.cookies.refreshToken).toBe('cde');
  },
  {
    'Valid refresh token, /graphql endpoint.': {
      input: {
        cookies: { refreshToken: signToken({ payload: {} }) },
        url: '/graphql'
      }
    }
  }
);

cases(
  `refreshTokenIfExpired() - Should not refresh the token.`,
  ({ input }: TestObject<RefreshTokenIfExpiredInput>) => {
    const req = { cookies: input.cookies, url: input.url } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    const mockedRefreshTokenFlow = jest.spyOn(refreshTokenFlow, 'default');

    // Call refreshTokenIfExpired().
    refreshTokenIfExpired(req, res, next);

    // Expect statements.
    expect(next).toBeCalled();
    expect(mockedRefreshTokenFlow).not.toBeCalled();
  },
  {
    'Access token is still present.': {
      input: {
        cookies: {
          accessToken: true,
          refreshToken: signToken({ payload: {} })
        },
        url: '/graphql'
      }
    },

    'Is not /graphql route.': {
      input: {
        cookies: { refreshToken: signToken({ payload: {} }) },
        url: '/google/auth'
      }
    },

    'No refreshToken is present.': {
      input: { cookies: { refreshToken: null }, url: '/graphql' }
    }
  }
);

// mockedRefreshTokenFlow.mockImplementation(() => {
//   return Promise.resolve({ accessToken: null, refreshToken: null });
// });
