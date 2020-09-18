/**
 * @fileoverview Resolver Argument: CreateMembership
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { CreateFormValue } from '@constants';

@ArgsType()
export default class CreateMembershipArgs {
  @Field()
  communityId: string;

  @Field(() => [CreateFormValue])
  data: CreateFormValue[];
}
