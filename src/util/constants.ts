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

export const GOOGLE = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: `${APP.SERVER_URL}/google/auth`
};

export const SENDGRID = { API_KEY: process.env.SENDGRID_API_KEY };

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

export enum FormQuestionCategory {
  FIRST_NAME = 'FIRST_NAME',
  LAST_NAME = 'LAST_NAME',
  EMAIL = 'EMAIL',
  GENDER = 'GENDER',
  MEMBERSHIP_TYPE = 'MEMBERSHIP_TYPE'
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
