/**
 * @fileoverview Resolver Arguments: Membership
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { CreateFormValue } from '@constants';

@ArgsType()
export class CreateMembershipArgs {
  @Field()
  communityId: string;

  @Field(() => [CreateFormValue])
  data: CreateFormValue[];

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

  @Field(() => Number)
  response: number;
}

@ArgsType()
export class UpdateMembershipArgs {
  @Field()
  communityId: string;

  @Field(() => [CreateFormValue])
  data: CreateFormValue[];

  @Field()
  userId: string;
}
