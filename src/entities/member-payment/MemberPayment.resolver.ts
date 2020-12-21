import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import Member from '../member/Member';
import createSubscription, {
  CreateSubsciptionArgs
} from './repo/createSubscription';

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
}
