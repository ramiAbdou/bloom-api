/**
 * @fileoverview Utility: GraphQL Types
 * @author Rami Abdou
 */

/* eslint-disable max-classes-per-file */

import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';

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
