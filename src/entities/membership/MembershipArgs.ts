/**
 * @fileoverview Resolver Arguments: Membership
 * @author Rami Abdou
 */

import { ArgsType, Field, Int } from 'type-graphql';

import { FormValueInput } from '@constants';

export type MembershipRole = 'ADMIN' | 'OWNER';

@ArgsType()
export class CreateMembershipArgs {
  @Field(() => [FormValueInput])
  data: FormValueInput[];

  // This will only be non-null if the User already exists.
  @Field({ nullable: true })
  userId: string;
}

@ArgsType()
export class MembershipResponseArgs {
  @Field()
  membershipIds: string[];

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

@ArgsType()
export class AddNewAdminArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  membershipId?: string;
}
