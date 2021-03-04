import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberSocials from './MemberSocials';
import getMemberSocials, {
  GetMemberSocialsArgs
} from './repo/getMemberSocials';

@Resolver()
export default class MemberSocialsResolver {
  @Query(() => MemberSocials)
  async getMemberSocials(
    @Args() args: GetMemberSocialsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberSocials> {
    return getMemberSocials(args, ctx);
  }
}
