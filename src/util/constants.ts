import dotenv from 'dotenv';
import { Response } from 'express';
import path from 'path'; // Before constants.

import BloomManager from '@core/db/BloomManager';

export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'testing';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const APP = {
  CACHE_TTL: 60 * 60 * 1000, // 1 hour, represented as ms.
  CLIENT_URL: isProduction
    ? process.env.APP_CLIENT_URL
    : 'http://localhost:3000',
  CRYPTR_SECRET: process.env.CRYPTR_SECRET,
  DB_URL: isProduction
    ? process.env.DB_PROD
    : 'postgresql://localhost:5432/bloom',
  PORT: process.env.PORT || 8080,
  SERVER_URL: isProduction
    ? process.env.APP_SERVER_URL
    : 'http://localhost:8080'
};

export const INTEGRATIONS = {
  DIGITAL_OCEAN_SPACE_URL: 'https://sfo2.digitaloceanspaces.com/bl.community',
  STRIPE_API_KEY: isProduction
    ? process.env.STRIPE_API_KEY
    : process.env.STRIPE_TEST_API_KEY
};

export const JWT = {
  EXPIRES_IN: 60 * 60, // Represents 1 hour (in s).
  SECRET: process.env.JWT_SECRET
};

/**
 * All exported TYPE declaration constants are below.
 * NOTE that if any services have types that are specific to them, they will
 * placed in a .types.ts file living in the same folder as that service,
 * instead of in this globally accessible constants file.
 */

export type AuthQueryParams = { code: string; state: string };
export type AuthTokens = { accessToken: string; refreshToken: string };

// Used for caching purposes (building the keys).
export enum QueryEvent {
  GET_ACTIVE_MEMBER_ANALYTICS = 'GET_ACTIVE_MEMBER_ANALYTICS',
  GET_APPLICANTS = 'GET_APPLICANTS',
  GET_APPLICATION = 'GET_APPLICATION',
  GET_DIRECTORY = 'GET_DIRECTORY',
  GET_INTEGRATIONS = 'GET_INTEGRATIONS',
  GET_MEMBERS = 'GET_MEMBERS',
  GET_TOTAL_MEMBER_ANALYTICS = 'GET_TOTAL_MEMBER_ANALYTICS',
  GET_USER = 'GET_USER'
}

export type LoggerEvent =
  | 'COMMUNITY_CREATED'
  | 'COMMUNITY_CSV_IMPORTED'
  | 'EMAIL_FAILED'
  | 'INVITED_MEMBER_ACCEPTED'
  | 'MAILCHIMP_LIST_STORED'
  | 'MAILCHIMP_LIST_UPDATED'
  | 'MAILCHIMP_TOKEN_STORED'
  | 'MEMBERS_ACCEPTED'
  | 'MEMBERS_CREATED'
  | 'MEMBERS_DEMOTED'
  | 'MEMBERS_PROMOTED'
  | 'ON_FLUSH'
  | 'QUESTION_RENAMED'
  | 'REFRESH_TOKEN_UPDATED'
  | 'SERVER_STARTED'
  | 'STRIPE_ACCOUNT_STORED'
  | 'STRIPE_SUBSCRIPTION_CREATED';

export type GQLContext = {
  communityId: string;
  memberId: string;
  res: Response;
  userId: string;
};

export type BloomManagerArgs = { bm: BloomManager };
