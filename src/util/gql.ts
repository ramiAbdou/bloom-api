/**
 * @fileoverview Utility: GraphQL Types
 * @author Rami Abdou
 */

import { fieldsProjection } from 'graphql-fields-list';
import { createParamDecorator, Field, InputType } from 'type-graphql';

/* eslint-disable max-classes-per-file */

export function Populate(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    return Object.keys(fieldsProjection(info)).reduce(
      (acc: string[], curr: string) => {
        if (!curr.includes('.')) return acc;
        const value = curr.substring(0, curr.lastIndexOf('.'));
        if (!acc.includes(value)) return [...acc, value];
        return acc;
      },
      []
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

// export const MembershipDataValue = new GraphQLScalarType({
//   description: 'Membership data value that can either be string or string[].',
//   name: 'MembershipDataValue',
//   parseValue(value: unknown): ObjectId {
//     // check the type of received value
//     if (typeof value !== 'string') {
//       throw new Error('ObjectIdScalar can only parse string values');
//     }
//     return new ObjectId(value); // value from the client input variables
//   },
//   serialize(value: unknown): string {
//     // check the type of received value
//     if (!(value instanceof ObjectId)) {
//       throw new Error('ObjectIdScalar can only serialize ObjectId values');
//     }
//     return value.toHexString(); // value sent to the client
//   }
// });

// const MembershipDataValue = createUnionType({
//   name: 'MembershipDataValue',
//   resolveType: (value) => (Array.isArray(value) ? [String] : String),
//   types: () => [[String], String] as const
// });

@InputType()
export class MembershipDataInput {
  @Field()
  questionId: string;

  @Field()
  value: string;
}
