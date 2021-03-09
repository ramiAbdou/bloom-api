import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Member from '@entities/member/Member';
import createStripeCustomer from '@integrations/stripe/repo/createStripeCustomer';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';

/**
 * Returns the updated MemberIntegrations with the Stripe customerId attached.
 *
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updateStripeCustomerId = async (
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [communityIntegrations, member, memberIntegrations]: [
    CommunityIntegrations,
    Member,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(Member, memberId),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (memberIntegrations.stripeCustomerId) return memberIntegrations;

  const stripeCustomer: Stripe.Customer = await createStripeCustomer({
    email: member.email,
    fullName: member.fullName,
    stripeAccountId: communityIntegrations.stripeAccountId
  });

  memberIntegrations.stripeCustomerId = stripeCustomer.id;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_STRIPE_CUSTOMER_ID });

  return memberIntegrations;
};

export default updateStripeCustomerId;
