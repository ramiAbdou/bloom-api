/**
 * @fileoverview Resolver Arguments: Membership
 * @author Rami Abdou
 */

import { ArgsType, Field, Int } from 'type-graphql';

import { FormValueInput } from '@constants';

@ArgsType()
export class CreateMembershipArgs {
  @Field()
  communityId: string;

  @Field(() => [FormValueInput])
  data: FormValueInput[];

  // This will only be non-null if the User already exists.
  @Field({ nullable: true })
  email: string;
}

@ArgsType()
export class MembershipResponseArgs {
  // Same as User ID.
  @Field()
  adminId: string;

  @Field()
  membershipId: string;

  @Field(() => Int)
  response: number;
}

@ArgsType()
export class UpdateMembershipArgs {
  @Field(() => [FormValueInput])
  data: FormValueInput[];

  @Field()
  membershipId: string;
}