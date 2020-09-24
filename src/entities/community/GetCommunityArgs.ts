/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export default class GetCommunityArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  encodedURLName?: string;
}
