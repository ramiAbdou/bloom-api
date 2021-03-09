import { nanoid } from 'nanoid';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';

/**
 * Returns the updated MemberIntegrations with stripeSubscriptionId set to null.
 * Also, cancels the Stripe.Subscription associated w/ stripeSubscriptionId.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const removeStripeSubscriptionId = async (
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [communityIntegrations, memberIntegrations]: [
    CommunityIntegrations,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // No need to cancel anything if no Stripe subscription exists.
  if (!memberIntegrations.stripeSubscriptionId) return memberIntegrations;

  await stripe.subscriptions.del(memberIntegrations.stripeSubscriptionId, {
    idempotencyKey: nanoid(),
    stripeAccount: communityIntegrations.stripeAccountId
  });

  memberIntegrations.stripeSubscriptionId = null;
  await bm.flush({ flushEvent: MutationEvent.REMOVE_STRIPE_SUBSCRIPTION_ID });

  return memberIntegrations;
};

export default removeStripeSubscriptionId;
