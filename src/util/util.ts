/**
 * @fileoverview Utility: General
 * @author Rami Abdou
 */

import { graphql } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import { JWT } from '@constants';
import { createSchema } from '../loaders/apollo';

interface GraphQLOptions {
  source: string;
  variables?: Maybe<{ [key: string]: any }>;
}

export const callGQL = async ({ source, variables }: GraphQLOptions) =>
  graphql({
    schema: await createSchema(),
    source,
    variableValues: variables
  });

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

type AuthTokens = { token: string; refreshToken: string };

/**
 * Generates and signs both a token and refreshToken. The refreshToken does
 * not expire, but the token expires after a limited amount of time.
 */
export const generateTokens = (payload: string | object): AuthTokens => ({
  refreshToken: jwt.sign(payload, JWT.SECRET),
  token: jwt.sign(payload, JWT.SECRET, { expiresIn: JWT.EXPIRES_IN })
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
