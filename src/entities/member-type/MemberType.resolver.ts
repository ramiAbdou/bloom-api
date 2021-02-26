import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import MemberType from './MemberType';
import getMemberTypes, { GetMemberTypesArgs } from './repo/getMemberTypes';

@Resolver()
export default class MemberTypeResolver {
  @Query(() => [MemberType])
  async getTypes(
    @Args() args: GetMemberTypesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberType[]> {
    return getMemberTypes(args, ctx);
  }
}
