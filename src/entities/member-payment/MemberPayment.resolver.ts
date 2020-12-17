import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import chargePayment, { ChargePaymentArgs } from './repo/chargePayment';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async chargePayment(@Args() args: ChargePaymentArgs, @Ctx() ctx: GQLContext) {
    return chargePayment(args, ctx);
  }
}
