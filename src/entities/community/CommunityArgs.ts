/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field, registerEnumType } from 'type-graphql';

import { FormInput } from '@util/gql';

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

  @Field(() => FormInput)
  membershipForm: FormInput;
}

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  encodedUrlName?: string;

  @Field(() => CommunityPopulation, { nullable: true })
  population?: CommunityPopulation;
}
