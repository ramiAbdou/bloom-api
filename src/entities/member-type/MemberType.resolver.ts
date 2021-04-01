import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberType from './MemberType';
import listMemberTypes, { ListMemberTypesArgs } from './repo/listMemberTypes';

@Resolver()
export default class MemberTypeResolver {
  @Query(() => [MemberType])
  async listMemberTypes(
    @Args() args: ListMemberTypesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberType[]> {
    return listMemberTypes(args, ctx);
  }
}
