import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import attachStripePaymentMethod from '@integrations/stripe/repo/attachStripePaymentMethod';
import { GQLContext } from '@util/constants';
import MemberIntegrations from '../MemberIntegrations';
import updateStripeCustomerId from './updateStripeCustomerId';

@ArgsType()
export class UpdateStripePaymentMethodIdArgs {
  @Field()
  paymentMethodId: string;
}

/**
 * Returns the updated MemberIntegrations with Stripe paymentMethodId
 * attached.
 *
 * @param args.paymentMethodId - ID of the Stripe PaymentMethod.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updateStripePaymentMethodId = async (
  args: UpdateStripePaymentMethodIdArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { paymentMethodId } = args;
  const { communityId, memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, memberIntegrations]: [
    CommunityIntegrations,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // If no Stripe customer ID exists on the member, create and attach the
  // stripeCustomerId to the member.
  const stripeCustomerId: string =
    memberIntegrations.stripeCustomerId ??
    (await updateStripeCustomerId(ctx))?.stripeCustomerId;

  // Attaches the PaymentMethod to the customer.
  await attachStripePaymentMethod({
    stripeAccountId: communityIntegrations.stripeAccountId,
    stripeCustomerId,
    stripePaymentMethodId: paymentMethodId
  });

  memberIntegrations.stripePaymentMethodId = paymentMethodId;
  await bm.flush();

  return memberIntegrations;
};

export default updateStripePaymentMethodId;
