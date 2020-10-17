/**
 * @fileoverview Utility: GraphQL Types
 * @author Rami Abdou
 */

import { fieldsProjection } from 'graphql-fields-list';
import { createParamDecorator, Field, InputType } from 'type-graphql';

/* eslint-disable max-classes-per-file */

export function Populate(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    const populate = Object.keys(fieldsProjection(info)).reduce(
      (acc: string[], curr: string) => {
        if (!curr.includes('.')) return acc;
        const value = curr.substring(0, curr.lastIndexOf('.'));
        if (!acc.includes(value)) return [...acc, value];
        return acc;
      },
      []
    );

    return [...populate].filter(
      (value) => !populate.some((val) => val.includes(`${value}.`))
    );
  });
}

export type QuestionType =
  | 'DROPDOWN_MULTIPLE'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
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
