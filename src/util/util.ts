/**
 * @fileoverview Utility: General
 * @author Rami Abdou
 */

import { graphql } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import moment from 'moment';

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
 * Returns the stringified value with extra line spaces removed, so it keeps
 * the entire string on one line.
 *
 * @example singleLineStringify({ user: { id: 1 } }) => '{ "user": 1 }'
 */
export const singleLineStringify = (value: any) =>
  JSON.stringify(value, null, 1).replace(/\s+/g, ' ');
