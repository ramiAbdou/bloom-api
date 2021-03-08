import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import Member from '@entities/member/Member';
import { stripe } from '@integrations/stripe/Stripe.util';
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

  // Need to query the Stripe.Customer by email since we don't have the
  // Stripe customer ID yet. If that Stripe.Customer already exists, let's just
  // use that ID instead of creating a new Stripe.Customer.
  const [existingStripeCustomer]: Stripe.Customer[] = (
    await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: stripeAccountId }
    )
  )?.data;

  // If for whatever reason there is a customer that already exists with the
  // user's email, just update the User with that Stripe customer ID, no need
  // to create another one.
  const stripeCustomerId: string = existingStripeCustomer
    ? existingStripeCustomer.id
    : (
        await stripe.customers.create(
          { email, name: fullName },
          { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
        )
      ).id;

  memberIntegrations.stripeCustomerId = stripeCustomerId;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_STRIPE_CUSTOMER_ID });

  return memberIntegrations;
};

export default updateStripeCustomerId;
