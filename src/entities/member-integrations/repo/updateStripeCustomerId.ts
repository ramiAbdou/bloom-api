import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Member from '@entities/member/Member';
import createStripeCustomer from '@integrations/stripe/repo/createStripeCustomer';
import { GQLContext } from '@util/constants';
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

  const bm: BloomManager = new BloomManager();

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

  // Otherwise, create the Stripe Customer and attach the ID to the
  // MemberIntegrations instance.
  const stripeCustomer: Stripe.Customer = await createStripeCustomer({
    email: member.email,
    fullName: member.fullName,
    stripeAccountId: communityIntegrations.stripeAccountId
  });

  memberIntegrations.stripeCustomerId = stripeCustomer.id;
  await bm.flush();

  return memberIntegrations;
};

export default updateStripeCustomerId;
