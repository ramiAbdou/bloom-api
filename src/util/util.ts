/**
 * @fileoverview Utility: General
 * @author Rami Abdou
 */

import { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import { AuthTokens, JWT } from '@constants';

/**
 * Generates and signs both a token and refreshToken. The refreshToken does
 * not expire, but the token expires after a limited amount of time.
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Returns the accessToken and refreshToken from the data.
 * Precondition: data has both an access_token and refresh_token.
 *
 * @example extractTokensFromAxios(
 *  { data: { access_token: 'a', refresh_token: 'b' } }
 * ) => { accessToken: 'a', refreshToken: 'b' }
 */
export const extractTokensFromAxios = ({
  data
}: AxiosResponse): AuthTokens => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token
});

/**
 * Generates and signs both a token and refreshToken. The refreshToken does
 * not expire, but the token expires after a limited amount of time.
 */
export const generateTokens = (payload: string | object): AuthTokens => ({
  accessToken: jwt.sign(payload, JWT.SECRET, { expiresIn: JWT.EXPIRES_IN }),
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
