/**
 * @group unit
 */

import express from 'express';
import cases from 'jest-in-case';

import * as refreshTokenFlow from '@entities/user/repo/refreshToken';
import { TestObject } from '@util/constants';
import { signToken } from '@util/util';
import refreshTokenIfExpired from './refreshTokenIfExpired';

type RefreshTokenIfExpiredInput = Pick<express.Request, 'cookies' | 'url'>;

cases(
  `refreshTokenIfExpired() - Should refresh the token and update req.`,
  async ({ input }: TestObject<RefreshTokenIfExpiredInput>) => {
    const req = { cookies: input.cookies, url: input.url } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    const mockedRefreshTokenFlow = jest
      .spyOn(refreshTokenFlow, 'default')
      .mockResolvedValue({ accessToken: 'abc', refreshToken: 'cde' });

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
  async ({ input }: TestObject<RefreshTokenIfExpiredInput>) => {
    const req = { cookies: input.cookies, url: input.url } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn() as express.NextFunction;

    jest.spyOn(refreshTokenFlow, 'default').mockResolvedValue(null);

    // Call refreshTokenIfExpired().
    await refreshTokenIfExpired(req, res, next);

    // Expect statements.
    expect(next).toBeCalled();
    expect(req.cookies.accessToken).toBe(input.cookies.accessToken);
    expect(req.cookies.refreshToken).toBe(input.cookies.refreshToken);
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
    },

    'Tried to refresh token, but no user found.': {
      input: {
        cookies: { refreshToken: signToken({ payload: {} }) },
        url: '/graphql'
      }
    }
  }
);
