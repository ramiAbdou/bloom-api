import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../member/Member';
import MemberPayment from './MemberPayment';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';
import getDuesInformation, {
  GetDuesInformationResult
} from './repo/getDuesInformation';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => Member, { nullable: true })
  async createSubscription(
    @Args() args: CreateSubsciptionArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createSubscription(args, ctx);
  }

  @Authorized()
  @Query(() => GetDuesInformationResult)
  async getDuesInformation(@Ctx() ctx: GQLContext) {
    return getDuesInformation(ctx);
  }

  @Authorized()
  @Query(() => [MemberPayment])
  async getPaymentHistory(@Ctx() { memberId }: GQLContext) {
    return new BloomManager().find(MemberPayment, { member: { id: memberId } });
  }
}
