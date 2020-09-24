/**
 * @fileoverview Resolver Argument: CreateMember
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

import { CreateFormValue } from '@constants';

@ArgsType()
export default class CreateMemberArgs {
  @Field()
  communityId: string;

  @Field(() => [CreateFormValue])
  data: CreateFormValue[];

  // This will only be non-null if the User already exists.
  @Field({ nullable: true })
  email: string;
}
