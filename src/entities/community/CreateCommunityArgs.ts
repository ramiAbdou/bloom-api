/**
 * @fileoverview Resolver Argument: CreateCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { FormQuestion } from '@constants';

@ArgsType()
export default class CreateCommunityArgs {
  @Field()
  name: string;

  @Field(() => [FormQuestion])
  membershipForm: FormQuestion[];
}
