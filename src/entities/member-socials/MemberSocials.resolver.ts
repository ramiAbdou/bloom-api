import { Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberSocials from './MemberSocials';
import getAllMemberSocials from './repo/getAllMemberSocials';
import getMemberSocials, {
  GetMemberSocialsArgs
} from './repo/getMemberSocials';
import updateMemberSocials, {
  UpdateMemberSocialsArgs
} from './repo/updateMemberSocials';

@Resolver()
export default class MemberSocialsResolver {
  @Query(() => MemberSocials)
  async getMemberSocials(
    @Args() args: GetMemberSocialsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberSocials> {
    return getMemberSocials(args, ctx);
  }

  @Query(() => [MemberSocials])
  async getAllMemberSocials(@Ctx() ctx: GQLContext): Promise<MemberSocials[]> {
    return getAllMemberSocials(ctx);
  }

  @Mutation(() => MemberSocials)
  async updateMemberSocials(
    @Args() args: UpdateMemberSocialsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberSocials> {
    return updateMemberSocials(args, ctx);
  }
}
