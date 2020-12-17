import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import createPaymentIntent, {
  CreatePaymentIntentArgs
} from './repo/createPaymentIntent';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => String, { nullable: true })
  async createPaymentIntent(
    @Args() args: CreatePaymentIntentArgs,
    @Ctx() ctx: GQLContext
  ) {
    return createPaymentIntent(args, ctx);
  }
}
