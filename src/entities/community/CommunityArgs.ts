/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { MembershipQuestionInput } from '../membership-question/MembershipQuestionArgs';
import { MembershipTypeInput } from '../membership-type/MembershipTypeArgs';

type CommunityOwnerArgs = {
  email: string;
  firstName: string;
  lastName: string;
};

export class CreateCommunityArgs {
  applicationDescription?: string;

  applicationTitle?: string;

  autoAccept? = false;

  name: string;

  questions: MembershipQuestionInput[];

  owner: CommunityOwnerArgs;

  types: MembershipTypeInput[];
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
