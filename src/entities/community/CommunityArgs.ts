/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import MembershipQuestionInput from '../membership-question/MembershipQuestionInput';

@ArgsType()
export class CreateCommunityArgs {
  @Field({ nullable: true })
  applicationDescription: string;

  @Field({ nullable: true })
  applicationTitle: string;

  @Field(() => Boolean)
  autoAccept = false;

  @Field()
  name: string;

  @Field(() => [MembershipQuestionInput])
  questions: MembershipQuestionInput[];
}
