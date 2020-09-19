/**
 * @fileoverview Resolver Argument: UpdateMembership
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { CreateFormValue } from '@constants';

@ArgsType()
export default class UpdateMembershipArgs {
  @Field()
  communityId: string;

  @Field(() => [CreateFormValue])
  data: CreateFormValue[];

  @Field()
  userId: string;
}
