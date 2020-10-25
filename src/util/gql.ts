/**
 * @fileoverview Utility: GraphQL Types
 * @author Rami Abdou
 */

import { Field, InputType } from 'type-graphql';

export type QuestionType =
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'SHORT_TEXT';

export type QuestionCategory =
  | 'DATE_JOINED'
  | 'EMAIL'
  | 'FIRST_NAME'
  | 'GENDER'
  | 'LAST_NAME'
  | 'MEMBERSHIP_TYPE';

@InputType()
export class MembershipDataInput {
  @Field()
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}
