import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberValue from './MemberValue';
import getMemberValues, { GetMemberValueArgs } from './repo/getMemberValues';
import updateMemberValues, {
  UpdateMemberValuesArgs
} from './repo/updateMemberValue';

@Resolver()
export default class MemberValueResolver {
  @Authorized()
  @Query(() => [MemberValue])
  async getMemberValues(
    @Args() args: GetMemberValueArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberValue[]> {
    return getMemberValues(args, ctx);
  }

  @Authorized()
  @Mutation(() => [MemberValue])
  async updateMemberValues(
    @Args() args: UpdateMemberValuesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberValue[]> {
    return updateMemberValues(args, ctx);
  }
}