import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberPlan, { RecurrenceType } from '@entities/member-plan/MemberPlan';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';

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

  // Create the subscription even if the product is LIFETIME fulfilled
  // subscription.
  const product: Stripe.Product = await stripe.products.create(
    { id, name },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  let recurring: Partial<Stripe.PriceCreateParams> = {};

  if (recurrence !== RecurrenceType.LIFETIME) {
    recurring = {
      recurring: {
        interval: recurrence === RecurrenceType.MONTHLY ? 'month' : 'year'
      }
    };
  }

  const price: Stripe.Price = await stripe.prices.create(
    {
      ...recurring,
      currency: 'usd',
      product: product.id,
      unit_amount: amount * 100
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  plan.stripePriceId = price.id;
  plan.stripeProductId = product.id;

  return plan;
};

/**
 * Creates the corresponding Stripe products and prices for every MemberPlan
 * that isn't free. Updates the MemberPlan entity as well.
 */
const createStripeProducts = async (ctx: Pick<GQLContext, 'communityId'>) => {
  const { communityId } = ctx;

  const bm = new BloomManager();

  const [integrations, plans]: [
    Integrations,
    MemberPlan[]
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.find(MemberPlan, { community: communityId })
  ]);

  const updatedTypes: MemberPlan[] = await Promise.all(
    plans.map(async (plan: MemberPlan) => {
      return attachStripeProduct({
        plan,
        stripeAccountId: integrations.stripeAccountId
      });
    })
  );

  await bm.flush({ flushEvent: MutationEvent.CREATE_STRIPE_PRODUCTS });
  return updatedTypes;
};

export default createStripeProducts;
