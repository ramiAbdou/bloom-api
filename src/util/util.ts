/* eslint-disable @typescript-eslint/no-use-before-define */

import day from 'dayjs';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { AuthTokens, isProduction, JWT } from '@util/constants';

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
 * Returns true if the entity has and of the keys in the given entity, even
 * if the value of the key is null.
 *
 * @param entity Object with keys. Could be empty, but not null.
 * @param keys List of keys in the object.
 *
 * @example hasKeys({ firstName: 'Rami', age: 21 }, ['firstName']) => true
 * @example hasKeys({ firstName: 'Rami', age: 21 }, ['lastName']) => false
 */
export function hasKeys<T>(entity: T, keys: (keyof T)[]) {
  return keys.some((key: keyof T) => key in entity);
}

/**
 * Returns the current UTC timestamp as a string to the millisecond.
 *
 * @example now() => '2020-08-31T23:17:20Z'
 */
export const now = () => day.utc().format();

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

/**
 * Returns the original array split into chunks with a maximum size of N. If
 * original array is less than size N, just returns original array.
 *
 * @param arr Original array to split.
 * @param maxChunkSize Maximum size of a chunk.
 */
export const splitArrayIntoChunks = (
  arr: any[],
  maxChunkSize: number
): any[][] => {
  if (arr.length <= maxChunkSize) return [arr];

  return arr.reduce((acc: any[][], item: any, i: number) => {
    const chunkIndex: number = Math.floor(i / maxChunkSize);

    // Start a new chunk.
    if (!acc[chunkIndex]) acc[chunkIndex] = [];

    // Push the new item onto the correct chunk.
    acc[chunkIndex].push(item);

    return acc;
  }, []);
};

/**
 * Returns the first value in which the condition is true.
 */
export const take = (arr: ([boolean, any] | any)[]) => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (!Array.isArray(element) && !!element) return element;
    if (element[0]) return element[1];
  }

  return null;
};
