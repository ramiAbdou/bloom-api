import dotenv from 'dotenv';
import { Response } from 'express';
import path from 'path'; // Before constants.

import sg from '@sendgrid/mail';

export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'testing';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({ path: path.join(__dirname, '../../.env') });

sg.setApiKey(process.env.SENDGRID_API_KEY);

export const APP = {
  CACHE_TTL: 60 * 60 * 1000, // 1 hour, represented as ms.
  CLIENT_URL: isProduction
    ? process.env.APP_CLIENT_URL
    : 'http://localhost:3000',
  DB_URL: isProduction
    ? process.env.DB_PROD
    : 'postgresql://localhost:5432/bloom',
  PORT: process.env.PORT || 8080,
  SERVER_URL: isProduction
    ? process.env.APP_SERVER_URL
    : 'http://localhost:8080'
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

export type AuthQueryArgs = { code: string; state: string };
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
