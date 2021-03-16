/* eslint-disable @typescript-eslint/no-use-before-define */

import day from 'dayjs';
import jwt from 'jsonwebtoken';

import { JWT } from '@util/constants';

/**
 * Returns the URL with the URL params.
 *
 * @param url - URL to start with.
 * @param params - URL param object to build the URL.
 */
export const buildUrl = (
  url: string,
  params: Record<string, string>
): string => {
  return Object.entries(params).reduce(
    (acc: string, [key, value]: [string, string], i: number) => {
      const paramChar: string = i === 0 ? '?' : '&';
      return `${acc}${paramChar}${key}=${value}`;
    },
    url
  );
};

/**
 * Returns the decoded information stored inside the JWT token. We first
 * verify the token to ensure that it is not expired, then decode it.
 */
export const decodeToken = (token: string): any => {
  const isVerified: boolean = verifyToken(token);

  try {
    return isVerified && jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Returns the current UTC timestamp as a string to the millisecond.
 *
 * @example now() => '2020-08-31T23:17:20Z'
 */
export const now = () => day.utc().format();

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
 * Returns the second value of the 2-tuple who's first value returns true.
 *
 * @param arr - Array of 2-tuples in which the first value gets evaluated to a
 * boolean.
 */
export const take = (arr: [any, any][]) => {
  for (let i = 0; i < arr.length; i++) {
    const element: [any, any] = arr[i];
    if (element[0]) return element[1];
  }

  return null;
};

/**
 * Returns true if the token is both a valid JWT token and if it has not yet
 * expired. Returns false otherwise.
 */
export const verifyToken = (token: string): boolean => {
  try {
    return !!jwt.verify(token, JWT.SECRET);
  } catch {
    return false;
  }
};
