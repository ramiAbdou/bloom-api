import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import getPaymentClientSecret, {
  GetPaymentClientSecretArgs
} from './repo/getPaymentClientSecret';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => String, { nullable: true })
  async getPaymentClientSecret(
    @Args() args: GetPaymentClientSecretArgs,
    @Ctx() ctx: GQLContext
  ) {
    return getPaymentClientSecret(args, ctx);
  }
}
