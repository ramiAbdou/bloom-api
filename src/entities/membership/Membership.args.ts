/**
 * @fileoverview Resolver Arguments: Membership
 * @author Rami Abdou
 */

import { ArgsType, Field, InputType, ObjectType } from 'type-graphql';

import { MembershipDataInput } from '@util/gql';
import { MembershipStatus } from '../membership-card-item/MembershipCardItem';

export type MembershipRole = 'ADMIN' | 'OWNER';

@ArgsType()
export class ApplyForMembershipArgs {
  @Field(() => [MembershipDataInput])
  data: MembershipDataInput[];

  @Field()
  email: string;

  @Field()
  encodedUrlName: string;
}

@ArgsType()
export class RespondToMembershipsArgs {
  @Field(() => [String])
  membershipIds: string[];

  @Field(() => String)
  response: MembershipStatus;
}

@ArgsType()
export class DeleteMembershipsArgs {
  @Field(() => [String])
  membershipIds: string[];
}

@InputType()
export class NewMemberInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean)
  isAdmin: boolean;
}

@ArgsType()
export class CreateMembershipsArgs {
  @Field(() => [NewMemberInput])
  members: NewMemberInput[];
}

@ObjectType()
export class MemberData {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
