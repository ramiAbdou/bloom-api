import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import Member from '../member/Member';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getDuesInformation, {
  GetDuesInformationResult
} from './repo/getDuesInformation';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Query(() => GetDuesInformationResult)
  async getDuesInformation(@Ctx() ctx: GQLContext) {
    return getDuesInformation(ctx);
  }

  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async createSubscription(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createSubscription(args, ctx);
  }
}
