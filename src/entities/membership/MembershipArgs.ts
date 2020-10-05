/**
 * @fileoverview Resolver Arguments: Membership
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { MembershipDataInput } from '@util/gql';

export type MembershipRole = 'ADMIN' | 'OWNER';

@ArgsType()
export class ApplyForMembershipArgs {
  @Field(() => [MembershipDataInput])
  data: MembershipDataInput[];

  @Field()
  email: string;
}
