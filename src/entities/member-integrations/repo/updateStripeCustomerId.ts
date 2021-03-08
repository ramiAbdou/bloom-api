import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
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

  const [communityIntegrations, memberIntegrations]: [
    Integrations,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (memberIntegrations.stripeCustomerId) return memberIntegrations;

  const { stripeAccountId }: Integrations = communityIntegrations;
  const { email, fullName }: Member = memberIntegrations.member;

  const stripeCustomer: Stripe.Customer = await createStripeCustomer({
    email,
    fullName,
    stripeAccountId
  });

  memberIntegrations.stripeCustomerId = stripeCustomer.id;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_STRIPE_CUSTOMER_ID });

  return memberIntegrations;
};

export default updateStripeCustomerId;
