/**
 * @fileoverview Utility: General
 * @author Rami Abdou
 */

import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import moment from 'moment';
import { buildSchema } from 'type-graphql';

import CommunityResolver from '../entities/community/CommunityResolver';
import MembershipResolver from '../entities/membership/MembershipResolver';
import UserResolver from '../entities/user/UserResolver';

interface Options {
  source: string;
  variables?: Maybe<{ [key: string]: any }>;
}

/**
 * Creates the GraphQL Schema based on the resolvers.
 */
export const createSchema = async (): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: [CommunityResolver, MembershipResolver, UserResolver],
    // Only set to false b/c we don't use the class-validator anywhere YET.
    validate: false
  });

export const callGQL = async ({ source, variables }: Options) =>
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

export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'testing';
