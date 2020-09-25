/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field, registerEnumType } from 'type-graphql';

import { FormQuestionInput } from '@constants';
import { MembershipType } from '@entities';

export enum CommunityPopulation {
  GET_MEMBERSHIPS = 'GET_MEMBERSHIPS'
}

registerEnumType(CommunityPopulation, { name: 'CommunityPopulation' });

@ArgsType()
export class CreateCommunityArgs {
  @Field()
  name: string;

  @Field(() => Boolean)
  autoAccept? = false;

  // True if there is a current Member CSV file stored for the community.
  @Field(() => Boolean)
  hasCSV? = false;

  @Field(() => [FormQuestionInput])
  membershipForm: FormQuestionInput[];

  @Field(() => [MembershipType])
  membershipTypes: MembershipType[];
}

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  encodedURLName?: string;

  @Field(() => CommunityPopulation, { nullable: true })
  population?: CommunityPopulation;
}
