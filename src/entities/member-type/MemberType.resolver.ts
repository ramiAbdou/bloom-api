import { Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import MemberType from './MemberType';
import getTypes from './repo/getTypes';

@Resolver()
export default class MemberTypeResolver {
  @Authorized()
  @Mutation(() => [MemberType], { nullable: true })
  async getMemberTypes(@Ctx() ctx: GQLContext) {
    return getTypes(ctx);
  }
}
