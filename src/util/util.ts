/* eslint-disable @typescript-eslint/no-use-before-define */

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import hash from 'object-hash';

import { AuthTokens, isProduction, JWT } from '@constants';

/**
 * Creates a hashed key based on the data given. The same exact cache key will
 * be given for the same object, as the hashing function performs a deep
 * equality.
 */
export const buildCacheKey = (data: Record<string, any>) =>
  hash(
    Object.entries(data).reduce(
      (acc: Record<string, any>, [key, value]) =>
        value ? { ...acc, [key]: value } : acc,
      {}
    )
  );

/**
 * Returns the decoded information stored inside the JWT token. We first
 * verify the token to ensure that it is not expired, then decode it.
 */
export const decodeToken = (token: string): any => {
  try {
    return verifyToken(token) && jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Generates and signs both a token and refreshToken. The refreshToken does
 * not expire, but the token expires after a limited amount of time.
 */
export const generateTokens = (
  payload: string | object,
  expiresIn?: number
): AuthTokens => ({
  accessToken: jwt.sign(payload, JWT.SECRET, {
    expiresIn: expiresIn ?? JWT.EXPIRES_IN
  }),
  refreshToken: jwt.sign(payload, JWT.SECRET)
});

/**
 * Returns the string as lowercase with spaces replaced by dashes.
 *
 * @example toLowerCaseDash('ColorStack') => 'colorstack'
 * @example toLowerCaseDash('Color Stack') => 'color-stack'
 */
export const toLowerCaseDash = (str: string) =>
  str.replace(/\s+/g, '-').toLowerCase();

/**
 * Returns the current UTC timestamp as a string to the millisecond.
 *
 * @example now() => '2020-08-31T23:17:20Z'
 */
export const now = () => moment.utc().format();

/**
 * Returns true if the token is both a valid JWT token and if it has not yet
 * expired.
 */
export const verifyToken = (token: string): boolean => {
  try {
    return !!jwt.verify(token, JWT.SECRET);
  } catch {
    return false;
  }
};

/**
 * Sets the appropriate refreshToken and accessToken httpOnly cookies on the
 * Express Response object with the token values passed in.
 */
export const setHttpOnlyTokens = (
  res: Response,
  { accessToken, refreshToken }: AuthTokens
) => {
  const options = { httpOnly: true, secure: isProduction };
  res.cookie('refreshToken', refreshToken, options);

  res.cookie('accessToken', accessToken, {
    ...options,
    maxAge: JWT.EXPIRES_IN * 1000 // x1000 because represented as milliseconds.
  });
};
