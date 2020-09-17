/**
 * @fileoverview Utility: General
 * @author Rami Abdou
 */

import moment from 'moment';

/**
 * Returns the string as lowercase with spaces replaced by dashes.
 *
 * @example toLowerCaseDash('ColorStack') -> 'colorstack'
 * @example toLowerCaseDash('Color Stack') -> 'color-stack'
 */
export const toLowerCaseDash = (str: string) =>
  str.replace(/\s+/g, '-').toLowerCase();

/**
 * Returns the current UTC timestamp as a string to the millisecond.
 *
 * @example now() -> '2020-08-31T23:17:20Z'
 */
export const now = () => moment.utc().format();

/**
 * Returns the stringified value with extra line spaces removed, so it keeps
 * the entire string on one line.
 *
 * @example singleLineStringify({ user: { id: 1 } }) -> '{ "user": 1 }'
 */
export const singleLineStringify = (value: any) =>
  JSON.stringify(value, null, 1).replace(/\s+/g, ' ');

export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'testing';
