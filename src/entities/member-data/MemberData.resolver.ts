import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import MemberData from './MemberData';
import updateMemberData, {
  UpdateMemberDataArgs
} from './repo/updateMemberData';

@Resolver()
export default class MemberDataResolver {
  @Authorized('ADMIN')
  @Mutation(() => [MemberData])
  async updateMemberData(
    @Args() args: UpdateMemberDataArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberData[]> {
    return updateMemberData(args, ctx);
  }
}
