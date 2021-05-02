import dotenv from 'dotenv';
import { Response } from 'express';
import path from 'path'; // Before constants.

import sg from '@sendgrid/mail';
import { HasuraRole } from '../integrations/hasura/Hasura.types';

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

/**
 * ENUMS
 */

export enum CookieType {
  LOGIN_ERROR = 'LOGIN_ERROR'
}

export enum ErrorType {
  APPLICATION_PENDING = 'APPLICATION_PENDING',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  EVENT_FINISHED = 'EVENT_FINISHED',
  EVENT_HASNT_STARTED = 'EVENT_HASNT_STARTED',
  NO_MEMBER_APPLICATIONS = 'NO_MEMBER_APPLICATIONS',
  NOT_MEMBER = 'NOT_MEMBER',
  USER_NOT_FOUND = 'USER_NOT_FOUND'
}

export interface GQLContext {
  communityId: string;
  hasuraRole: HasuraRole;
  res: Response;
  userId: string;
}

export interface TestObject<T = any, S = any> {
  before?: () => Promise<any>;
  input?: T;
  output?: S;
}
