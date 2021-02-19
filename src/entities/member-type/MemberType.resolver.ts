import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import MemberType from './MemberType';
import getTypes, { GetTypesArgs } from './repo/getTypes';

@Resolver()
export default class MemberTypeResolver {
  @Query(() => [MemberType])
  async getTypes(
    @Args() args: GetTypesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberType[]> {
    return getTypes(args, ctx);
  }
}
