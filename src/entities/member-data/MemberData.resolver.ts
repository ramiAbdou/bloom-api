import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { MemberIdArgs } from '../member/Member.types';
import MemberData from './MemberData';
import getMemberData from './repo/getMemberData';
import updateMemberData, {
  UpdateMemberDataArgs
} from './repo/updateMemberData';

@Resolver()
export default class MemberDataResolver {
  @Authorized()
  @Query(() => [MemberData])
  async getMemberData(
    @Args() args: MemberIdArgs,
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
