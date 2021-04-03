import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberSocials from './MemberSocials';
import updateMemberSocials, {
  UpdateMemberSocialsArgs
} from './repo/updateMemberSocials';

@Resolver()
export default class MemberSocialsResolver {
  @Mutation(() => MemberSocials)
  async updateMemberSocials(
    @Args() args: UpdateMemberSocialsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberSocials> {
    return updateMemberSocials(args, ctx);
  }
}
