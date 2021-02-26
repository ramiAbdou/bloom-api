import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberData from './MemberData';
import getMemberData, { GetMemberDataArgs } from './repo/getMemberData';
import updateMemberData, {
  UpdateMemberDataArgs
} from './repo/updateMemberData';

@Resolver()
export default class MemberDataResolver {
  @Authorized()
  @Query(() => [MemberData])
  async getMemberData(
    @Args() args: GetMemberDataArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberData[]> {
    return getMemberData(args, ctx);
  }

  @Authorized()
  @Mutation(() => [MemberData])
  async updateMemberData(
    @Args() args: UpdateMemberDataArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberData[]> {
    return updateMemberData(args, ctx);
  }
}
