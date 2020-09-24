/**
 * @fileoverview Resolver Argument: CreateCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { CreateFormQuestion } from '@constants';
import { MembershipType } from '@entities';

@ArgsType()
export default class CreateCommunityArgs {
  @Field()
  name: string;

  @Field(() => Boolean)
  autoAccept? = false;

  @Field(() => [CreateFormQuestion])
  membershipForm: CreateFormQuestion[];

  @Field(() => [MembershipType])
  membershipTypes: MembershipType[];
}
