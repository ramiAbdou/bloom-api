/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Field, InputType } from 'type-graphql';

import MembershipQuestionOption from './MembershipQuestionOption';

@InputType()
export class MembershipQuestionOptionInput
  implements Partial<MembershipQuestionOption> {
  @Field()
  value: string;
}
