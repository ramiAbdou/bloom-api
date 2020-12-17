import { Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import getPaymentClientSecret from './repo/getPaymentClientSecret';

@Resolver()
export default class MemberPaymentResolver {
  @Authorized()
  @Mutation(() => String, { nullable: true })
  async getPaymentClientSecret(@Ctx() ctx: GQLContext) {
    return getPaymentClientSecret(ctx);
  }
}
