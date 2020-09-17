/**
 * @fileoverview Utility: Constants
 * - All constants required throughout the application including the common
 * types used throughout.
 * @author Rami Abdou, Enoch Chen
 */

import dotenv from 'dotenv';
import { Request, Response } from 'express';
import path from 'path'; // Before constants.

import { isProduction } from './util';

// Environment configuration must happen before loading the constants file
// because the constants depend on the environment being configured.
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const APP = {
  CLIENT_URL: isProduction
    ? process.env.APP_CLIENT_URL
    : 'http://localhost:3000',
  DB_URL: isProduction ? process.env.DB_PROD : process.env.DB_LOCAL,
  PORT: process.env.PORT || 8080,
  SERVER_URL: isProduction
    ? process.env.APP_SERVER_URL
    : 'http://localhost:8080'
};

/**
 * All exported TYPE declaration constants are below.
 * NOTE that if any services have types that are specific to them, they will
 * placed in a .types.ts file living in the same folder as that service,
 * instead of in this globally accessible constants file.
 */

export type LoggerLevel = 'INFO' | 'ERROR' | 'WARN';

export type Route = {
  callback: (request: Request, response: Response) => any;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  route: string;
};
