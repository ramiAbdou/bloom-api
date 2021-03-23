import dotenv from 'dotenv';
import { Response } from 'express';
import path from 'path'; // Before constants.

import sg from '@sendgrid/mail';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({
  path: path.join(__dirname, `../../.env.${process.env.APP_ENV}`)
});

sg.setApiKey(process.env.SENDGRID_API_KEY);

export const APP = {
  CACHE_TTL: 60 * 60 * 1000, // 1 hour, represented as ms.
  CLIENT_URL: process.env.APP_CLIENT_URL,
  SERVER_URL: process.env.APP_SERVER_URL
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

export interface TestObject<T = any, S = any> {
  before?: () => Promise<any>;
  input?: T;
  output?: S;
}
