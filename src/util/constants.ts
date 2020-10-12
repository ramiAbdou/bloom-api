/**
 * @fileoverview Utility: Constants
 * - All constants required throughout the application including the common
 * types used throughout.
 * @author Rami Abdou, Enoch Chen
 */

import dotenv from 'dotenv';
import { Request, Response } from 'express';
import path from 'path'; // Before constants.

export const isProduction = process.env.NODE_ENV === 'production';
export const isTesting = process.env.NODE_ENV === 'testing';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const APP = {
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
  EXPIRES_IN: 5 * 60 * 1000,
  SECRET: process.env.JWT_SECRET
};

/**
 * All exported TYPE declaration constants are below.
 * NOTE that if any services have types that are specific to them, they will
 * placed in a .types.ts file living in the same folder as that service,
 * instead of in this globally accessible constants file.
 */

export type LoggerEvent =
  | 'ADMIN_CREATED'
  | 'COMMUNITY_CREATED'
  | 'EMAIL_SENT'
  | 'EMAIL_VERIFIED'
  | 'EVENT_CREATED'
  | 'GOOGLE_REFRESH_TOKEN_STORED'
  | 'JOINED_EVENT_AS_GUEST'
  | 'JOINED_EVENT_AS_USER'
  | 'MAILCHIMP_TOKEN_STORED'
  | 'MEMBERSHIP_ADMISSION'
  | 'MEMBERSHIP_CREATED'
  | 'MEMBERSHIPS_DELETED'
  | 'MEMBERSHIP_DATA_UPDATED'
  | 'SERVER_STARTED'
  | 'TOKENS_UPDATED'
  | 'ZOOM_TOKENS_REFRESHED'
  | 'ZOOM_TOKENS_STORED';

export type Route = {
  callback: (request: Request, response: Response) => any;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  route: string;
};

export type GQLContext = { communityId: string; userId: string };
