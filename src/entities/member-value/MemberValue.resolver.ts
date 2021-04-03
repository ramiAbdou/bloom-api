import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberValue from './MemberValue';
import updateMemberValues, {
  UpdateMemberValuesArgs
} from './repo/updateMemberValues';

@Resolver()
export default class MemberValueResolver {
  @Authorized()
  @Mutation(() => [MemberValue])
  async updateMemberValues(
    @Args() args: UpdateMemberValuesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<MemberValue[]> {
    return updateMemberValues(args, ctx);
  }
}
