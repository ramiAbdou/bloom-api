import dotenv from 'dotenv';
import express from 'express';
import path from 'path'; // Before constants.

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

// ## EMAILS

export enum EmailType {
  LOGIN_LINK = 'LOGIN_LINK',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT'
}

// ## EVENTS

export enum FlushEvent {
  ACCEPT_APPLICANTS = 'ACCEPT_APPLICANTS',
  ACCEPT_INVITATIONS = 'ACCEPT_INVITATIONS',
  ADD_GOOGLE_CALENDAR_EVENT_ATTENDEE = 'ADD_GOOGLE_CALENDAR_EVENT_ATTENDEE',
  ADD_MEMBERS = 'ADD_MEMBERS',
  ADD_TO_MAILCHIMP = 'ADD_TO_MAILCHIMP',
  APPLY_FOR_MEMBERSHIP = 'APPLY_FOR_MEMBERSHIP',
  ATTACH_GOOGLE_CALENDAR_EVENT = 'ATTACH_GOOGLE_CALENDAR_EVENT',
  CREATE_COMMUNITY = 'CREATE_COMMUNITY',
  CREATE_EVENT = 'CREATE_EVENT',
  CREATE_EVENT_ATTENDEE = 'CREATE_EVENT_ATTENDEE',
  CREATE_EVENT_GUEST = 'CREATE_EVENT_GUEST',
  CREATE_EVENT_WATCH = 'CREATE_EVENT_WATCH',
  CREATE_GOOGLE_CALENDAR_EVENT = 'CREATE_GOOGLE_CALENDAR_EVENT',
  CREATE_MEMBER_REFRESH = 'CREATE_MEMBER_REFRESH',
  CREATE_STRIPE_CUSTOMER = 'CREATE_STRIPE_CUSTOMER',
  CREATE_STRIPE_PRODUCTS = 'CREATE_STRIPE_PRODUCTS',
  CREATE_SUBSCRIPTION = 'CREATE_SUBSCRIPTION',
  DELETE_EVENT = 'DELETE_EVENT',
  DELETE_EVENT_GUEST = 'DELETE_EVENT_GUEST',
  DELETE_GOOGLE_CALENDAR_EVENT = 'DELETE_GOOGLE_CALENDAR_EVENT',
  DELETE_GOOGLE_CALENDAR_EVENT_ATTENDEE = 'DELETE_GOOGLE_CALENDAR_EVENT_ATTENDEE',
  DELETE_MEMBERS = 'DELETE_MEMBERS',
  DELETE_SUBSCRIPTION = 'DELETE_SUBSCRIPTION',
  DEMOTE_MEMBERS = 'DEMOTE_MEMBERS',
  EMAIL_FAILED = 'EMAIL_FAILED',
  IGNORE_APPLICANTS = 'IGNORE_APPLICANTS',
  IMPORT_COMMUNITY_CSV = 'IMPORT_COMMUNITY_CSV',
  ON_FLUSH = 'ON_FLUSH',
  PROMOTE_MEMBERS = 'PROMOTE_MEMBERS',
  RESTORE_MEMBERS = 'RESTORE_MEMBERS',
  STORE_MAILCHIMP_TOKEN = 'STORE_MAILCHIMP_TOKEN',
  STORE_STRIPE_ACCOUNT = 'STORE_STRIPE_ACCOUNT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  UPDATE_EVENT_RECORDING_LINK = 'UPDATE_EVENT_RECORDING_LINK',
  UPDATE_GOOGLE_CALENDAR_EVENT = 'UPDATE_GOOGLE_CALENDAR_EVENT',
  UPDATE_INTEGRATIONS = 'UPDATE_INTEGRATIONS',
  UPDATE_MAILCHIMP = 'UPDATE_MAILCHIMP',
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  UPDATE_PAYMENT_METHOD = 'UPDATE_PAYMENT_METHOD',
  UPDATE_QUESTION = 'UPDATE_QUESTION',
  UPDATE_REFRESH_TOKEN = 'UPDATE_REFRESH_TOKEN',
  UPDATE_USER = 'UPDATE_USER'
}

export enum LoggerEvent {
  START_SERVER = 'START_SERVER'
}

// Used for caching purposes (building the keys).
export enum QueryEvent {
  // ## FIND ONE QUERIES

  GET_APPLICATION = 'GET_APPLICATION',
  GET_COMMUNITY = 'GET_COMMUNITY',
  GET_EVENT = 'GET_EVENT',
  GET_INTEGRATIONS = 'GET_INTEGRATIONS',
  GET_MEMBER = 'GET_MEMBER',
  GET_USER = 'GET_USER',

  // ## FIND QUERIES

  GET_QUESTIONS = 'GET_QUESTIONS',
  GET_PAYMENTS = 'GET_PAYMENTS',
  GET_TYPES = 'GET_TYPES',

  GET_ACTIVE_DUES_GROWTH = 'GET_ACTIVE_DUES_GROWTH',
  GET_ACTIVE_MEMBERS_GROWTH = 'GET_ACTIVE_MEMBERS_GROWTH',
  GET_ACTIVE_MEMBERS_SERIES = 'GET_ACTIVE_MEMBERS_SERIES',
  GET_APPLICANTS = 'GET_APPLICANTS',
  GET_DATABASE = 'GET_DATABASE',
  GET_DIRECTORY = 'GET_DIRECTORY',
  GET_EVENT_ATTENDEES = 'GET_EVENT_ATTENDEES',
  GET_EVENT_ATTENDEES_SERIES = 'GET_EVENT_ATTENDEES_SERIES',
  GET_EVENT_GUESTS = 'GET_EVENT_GUESTS',
  GET_EVENT_WATCHES = 'GET_EVENT_WATCHES',
  GET_MEMBER_DATA = 'GET_MEMBER_DATA',
  GET_MEMBERS = 'GET_MEMBERS',
  GET_OWNER = 'GET_OWNER',
  GET_PAST_EVENTS = 'GET_PAST_EVENTS',
  GET_PAST_EVENT_ATTENDEES = 'GET_PAST_EVENT_ATTENDEES',
  GET_PAST_EVENT_GUESTS = 'GET_PAST_EVENT_GUESTS',
  GET_PAST_EVENT_WATCHES = 'GET_PAST_EVENT_WATCHES',
  GET_TOTAL_DUES_COLLECTED = 'GET_TOTAL_DUES_COLLECTED',
  GET_TOTAL_DUES_GROWTH = 'GET_TOTAL_DUES_GROWTH',
  GET_TOTAL_DUES_SERIES = 'GET_TOTAL_DUES_SERIES',
  GET_TOTAL_MEMBERS_GROWTH = 'GET_TOTAL_MEMBERS_GROWTH',
  GET_TOTAL_MEMBERS_SERIES = 'GET_TOTAL_MEMBERS_SERIES',
  GET_UPCOMING_EVENTS = 'GET_UPCOMING_EVENTS',
  GET_UPCOMING_EVENT_GUESTS = 'GET_UPCOMING_EVENT_GUESTS'
}

export type GQLContext = {
  communityId: string;
  memberId: string;
  res: express.Response;
  userId: string;
};
