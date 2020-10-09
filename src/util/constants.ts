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
import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';

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
  | 'EMAIL_VERIFIED'
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
  | 'ZOOM_TOKENS_STORED';

export type Route = {
  callback: (request: Request, response: Response) => any;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  route: string;
};

export type GQLContext = { req: Request; res: Response; userId: string };

export enum FormQuestionCategory {
  FIRST_NAME = 'FIRST_NAME',
  LAST_NAME = 'LAST_NAME',
  EMAIL = 'EMAIL',
  GENDER = 'GENDER'
}

export enum FormQuestionType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DROPDOWN = 'DROPDOWN',
  DROPDOWN_MULTIPLE = 'DROPDOWN_MULTIPLE'
}

registerEnumType(FormQuestionCategory, { name: 'FormQuestionCategory' });
registerEnumType(FormQuestionType, { name: 'FormQuestionType' });

@ObjectType()
export class FormQuestion {
  @Field(() => FormQuestionCategory, { nullable: true })
  category?: FormQuestionCategory;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  required = false;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field()
  title: string;

  @Field(() => FormQuestionType)
  type: FormQuestionType;
}

@InputType()
export class FormQuestionInput {
  @Field(() => FormQuestionCategory, { nullable: true })
  category?: FormQuestionCategory;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  required = false;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field()
  title: string;

  @Field(() => FormQuestionType)
  type: FormQuestionType;
}

@ObjectType()
export class Form {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [FormQuestion])
  questions: FormQuestion[];
}

@InputType()
export class FormInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [FormQuestionInput])
  questions: FormQuestionInput[];
}

@ObjectType()
export class FormValue {
  @Field()
  title: string;

  @Field({ nullable: true })
  value?: string;
}

@InputType()
export class FormValueInput {
  // This will only be populated when there is a special form question, in which
  // case it will be added to the User entity.
  @Field(() => FormQuestionCategory, { nullable: true })
  category?: FormQuestionCategory;

  @Field({ nullable: true })
  title?: string;

  @Field()
  value: string;
}
