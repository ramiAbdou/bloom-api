/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { MembershipQuestionInput } from '../membership-question/MembershipQuestionArgs';
import { MembershipTypeInput } from '../membership-type/MembershipTypeArgs';

@ArgsType()
export class CreateCommunityArgs {
  @Field({ nullable: true })
  applicationDescription?: string;

  @Field({ nullable: true })
  applicationTitle?: string;

  @Field(() => Boolean)
  autoAccept? = false;

  @Field()
  name: string;

  @Field(() => [MembershipQuestionInput])
  questions: MembershipQuestionInput[];

  @Field(() => [MembershipTypeInput])
  types: MembershipTypeInput[];

  @Field({ nullable: true })
  overview: string;
}

@ArgsType()
export class GetCommunityArgs {
  @Field()
  encodedUrlName: string;
}

@ArgsType()
export class ImportCommunityCSVArgs {
  @Field()
  encodedUrlName: string;
}

@ArgsType()
export class ReorderQuestionArgs {
  @Field()
  communityId: string;

  @Field()
  questionId: string;

  @Field()
  order: number;
}
