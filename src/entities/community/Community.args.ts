/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { MembershipQuestionInput } from '../membership-question/MembershipQuestion.args';
import { MembershipTypeInput } from '../membership-type/MembershipType.args';

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

  primaryColor?: string;

  questions: MembershipQuestionInput[];

  owner: CommunityOwnerArgs;

  types: MembershipTypeInput[];
}

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  encodedUrlName: string;
}

@ArgsType()
export class ImportCommunityCSVArgs {
  @Field()
  encodedUrlName: string;
}
