import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { assign } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberPlan, { RecurrenceType } from '@entities/member-plan/MemberPlan';
import { stripe } from '@integrations/stripe/Stripe.util';

interface CreateStripeProductArgs {
  stripeAccountId: string;
  plan: MemberPlan;
}

/**
 * Updates the MemberPlan's stripePriceId and stripeProductId for all types
 * that are not free. Calls the Stripe SDK product and price creation methods
 * for the community.
 */
const attachStripeProduct = async (
  args: CreateStripeProductArgs
): Promise<MemberPlan> => {
  const { stripeAccountId, plan } = args;
  const { amount, id, name, recurrence } = plan;

  const product: Stripe.Product = await stripe.products.create(
    { id, name },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  const price: Stripe.Price = await stripe.prices.create(
    {
      currency: 'usd',
      product: product.id,
      recurring: {
        interval: recurrence === RecurrenceType.MONTHLY ? 'month' : 'year'
      },
      unit_amount: amount * 100
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  const updatedPlan: MemberPlan = assign(plan, {
    stripePriceId: price.id,
    stripeProductId: product.id
  });

  return updatedPlan;
};

interface CreateStripeProductsArgs {
  urlName: string;
}

/**
 * Creates the corresponding Stripe products and prices for every MemberPlan
 * that isn't free. Updates the MemberPlan entity as well.
 */
const createStripeProducts = async (
  args: CreateStripeProductsArgs
): Promise<MemberPlan[]> => {
  const { urlName } = args;

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, plans]: [
    CommunityIntegrations,
    MemberPlan[]
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { urlName } }),
    bm.find(MemberPlan, { community: { urlName } })
  ]);

  const updatedTypes: MemberPlan[] = await Promise.all(
    plans.map(async (plan: MemberPlan) => {
      return attachStripeProduct({
        plan,
        stripeAccountId: communityIntegrations.stripeAccountId
      });
    })
  );

  await bm.flush();
  return updatedTypes;
};

export default createStripeProducts;
