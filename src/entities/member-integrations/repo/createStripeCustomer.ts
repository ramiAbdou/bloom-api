import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';

/**
 * If the user does not have an associated Stripe customer object, create
 * that object and store it on the user entity.
 */
const createStripeCustomer = async (
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberIntegrations> => {
  const { memberId } = ctx;

  const bm = new BloomManager();

  const memberIntegrations: MemberIntegrations = await bm.findOne(
    MemberIntegrations,
    { member: memberId }
  );

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (memberIntegrations.stripeCustomerId) return memberIntegrations;

  await bm.em.populate(memberIntegrations, ['member.community.integrations']);

  const { email, fullName } = memberIntegrations.member;
  const { stripeAccountId } = memberIntegrations.member.community.integrations;

  const existingStripeCustomers: Stripe.Customer[] = (
    await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: stripeAccountId }
    )
  )?.data;

  // If for whatever reason there is a customer that already exists with the
  // user's email, just update the User with that Stripe customer ID, no need
  // to create another one.
  const stripeCustomerId: string = existingStripeCustomers.length
    ? existingStripeCustomers[0].id
    : (
        await stripe.customers.create(
          { email, name: fullName },
          { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
        )
      ).id;

  memberIntegrations.stripeCustomerId = stripeCustomerId;
  await bm.flush({ flushEvent: MutationEvent.CREATE_STRIPE_CUSTOMER });

  return memberIntegrations;
};

export default createStripeCustomer;
