import dotenv from 'dotenv';
import { Response } from 'express';
import path from 'path'; // Before constants.

import sg from '@sendgrid/mail';
import { take } from '@util/util';

export const isDevelopment = process.env.NODE_ENV === 'dev';
export const isProduction = process.env.NODE_ENV === 'prod';
export const isStage = process.env.NODE_ENV === 'stage';
export const isTest = process.env.NODE_ENV === 'test';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({ path: path.join(__dirname, '../../.env') });

sg.setApiKey(process.env.SENDGRID_API_KEY);

export const APP = {
  CACHE_TTL: 60 * 60 * 1000, // 1 hour, represented as ms.
  CLIENT_URL: take([
    [isDevelopment, process.env.APP_DEV_CLIENT_URL],
    [isStage, process.env.APP_STAGE_CLIENT_URL],
    [isProduction, process.env.APP_PROD_CLIENT_URL]
  ]),
  DB_URL: take([
    [isDevelopment, process.env.DB_DEV_URL],
    [isStage, process.env.DB_STAGE_URL],
    [isProduction, process.env.DB_PROD_URL]
  ]),
  PORT: process.env.PORT || 8080,
  SERVER_URL: take([
    [isDevelopment, process.env.APP_DEV_SERVER_URL],
    [isStage, process.env.APP_STAGE_SERVER_URL],
    [isProduction, process.env.APP_PROD_SERVER_URL]
  ])
};

export const JWT = {
  EXPIRES_IN: 60 * 60, // Represents 1 hour (in s).
  SECRET: process.env.JWT_SECRET
};

export const TEST_EMAILS = ['ra494@cornell.edu', 'rami@onbloom.co'];

/**
 * All exported TYPE declaration constants are below.
 * NOTE that if any services have types that are specific to them, they will
 * placed in a .types.ts file living in the same folder as that service,
 * instead of in this globally accessible constants file.
 */

export type AuthQueryArgs = { code: string; state?: string };
export type AuthTokens = { accessToken: string; refreshToken: string };

export enum IntegrationsBrand {
  MAILCHIMP = 'Mailchimp',
  STRIPE = 'Stripe',
  ZAPIER = 'Zapier'
}

export type KeyValue = { key: string; value: any };

// ## GRAPHQL

export type GQLContext = {
  communityId: string;
  memberId: string;
  res: Response;
  userId: string;
};
