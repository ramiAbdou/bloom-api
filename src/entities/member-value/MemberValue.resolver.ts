import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import MemberValue from './MemberValue';
import listMemberValues, {
  ListMemberValuesArgs
} from './repo/listMemberValues';
import updateMemberValues, {
  UpdateMemberValuesArgs
} from './repo/updateMemberValues';

@Resolver()
export default class MemberValueResolver {
  @Authorized()
  @Query(() => [MemberValue])
  async listMemberValues(
    @Args() args: ListMemberValuesArgs
  ): Promise<MemberValue[]> {
    return listMemberValues(args);
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
