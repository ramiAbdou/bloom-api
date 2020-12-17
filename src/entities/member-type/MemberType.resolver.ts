import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import MemberType from './MemberType';
import getTypes from './repo/getTypes';

@Resolver()
export default class MemberTypeResolver {
  @Authorized()
  @Query(() => [MemberType], { nullable: true })
  async getMemberTypes(@Ctx() ctx: GQLContext) {
    return getTypes(ctx);
  }
}
