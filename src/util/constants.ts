import dotenv from 'dotenv';
import { Request, Response } from 'express';
import path from 'path'; // Before constants.
import { MemberRole } from 'src/entities/member/Member.args';

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
export enum Event {
  GET_APPLICANTS = 'GET_APPLICANTS',
  GET_APPLICATION = 'GET_APPLICATION',
  GET_DIRECTORY = 'GET_DIRECTORY',
  GET_MEMBERS = 'GET_MEMBERS',
  GET_INTEGRATIONS = 'GET_INTEGRATIONS'
}

export type LoggerEvent =
  | 'COMMUNITY_CREATED'
  | 'COMMUNITY_CSV_PROCESSED'
  | 'EMAIL_FAILED'
  | 'GET_APPLICANTS'
  | 'MAILCHIMP_LIST_STORED'
  | 'MAILCHIMP_LIST_MEMBERS_ADDED'
  | 'MAILCHIMP_TOKEN_STORED'
  | 'MEMBERSHIP_ADMISSION'
  | 'MEMBERSHIPS_ADMIN_STATUS_UPDATED'
  | 'MEMBERSHIP_CREATED'
  | 'MEMBERSHIPS_CREATED'
  | 'MEMBERSHIPS_DELETED'
  | 'MEMBERSHIP_DATA_UPDATED'
  | 'MEMBERSHIPS_INVITED_STATUS_UPDATED'
  | 'QUESTION_RENAMED'
  | 'REFRESH_TOKEN_STORED'
  | 'SERVER_STARTED'
  | 'STRIPE_ACCOUNT_STORED';

export type LoginError =
  | 'APPLICATION_PENDING'
  | 'APPLICATION_REJECTED'
  | 'USER_NOT_FOUND';

export type GQLContext = {
  communityId: string;
  res: Response;
  role: MemberRole;
  userId: string;
};

export type Route = {
  callback: (request: Request, response: Response) => any;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  route: string;
};
