/**
 * @fileoverview Utility: Constants
 * - All constants required throughout the application including the common
 * types used throughout.
 * @author Rami Abdou, Enoch Chen
 */

/* eslint-disable max-classes-per-file */

import dotenv from 'dotenv';
import { Request, Response } from 'express';
import path from 'path'; // Before constants.
import { Field, InputType, ObjectType } from 'type-graphql';

import { isProduction } from './util';

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

type FormQuestionCategory =
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'EMAIL'
  | 'GENDER'
  | 'MEMBERSHIP_TYPE';

type FormQuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'DROPDOWN'
  | 'DROPDOWN_MULTIPLE';

@ObjectType()
export class FormQuestion {
  @Field(() => String, { nullable: true })
  category?: FormQuestionCategory;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  required? = false;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field(() => String)
  title: string;

  @Field(() => String)
  type: FormQuestionType;
}

@InputType()
export class CreateFormQuestion {
  @Field(() => String, { nullable: true })
  category?: FormQuestionCategory;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  required? = false;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field(() => String)
  title: string;

  @Field(() => String)
  type: FormQuestionType;
}

@ObjectType()
export class GetFormValue {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  value?: string;
}

@InputType()
export class CreateFormValue {
  // This will only be populated when there is a special form question, in which
  // case it will be added to the User entity.
  @Field(() => String, { nullable: true })
  category: FormQuestionCategory;

  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;
}
