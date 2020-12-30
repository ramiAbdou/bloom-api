import Stripe from 'stripe';
import { wrap } from '@mikro-orm/core';

import { RecurrenceType } from '@entities/member-type/MemberType.types';
import { stripe } from '@integrations/stripe/Stripe.util';
import MemberType from '../MemberType';

type CreateStripeProductParams = {
  stripeAccountId: string;
  type: MemberType;
};

type CreateStripeProductsParams = {
  stripeAccountId: string;
  types: MemberType[];
};

/**
 * Updates the MemberType's stripePriceId and stripeProductId for all types
 * that are not free. Calls the Stripe SDK product and price creation methods
 * for the community.
 */
const createStripeProduct = async ({
  stripeAccountId,
  type
}: CreateStripeProductParams) => {
  const { amount, id, name, recurrence } = type;

  // If the membership is free, no need to create a Stripe subscription
  // product and price.
  if (!amount) return;

  // Create the subscription even if the product is LIFETIME fulfilled
  // subscription.
  const { id: stripeProductId } = await stripe.products.create(
    { id, name },
    { stripeAccount: stripeAccountId }
  );

  const recurring: Partial<Stripe.PriceCreateParams> =
    recurrence === RecurrenceType.LIFETIME
      ? {}
      : {
          recurring: {
            interval: recurrence === RecurrenceType.MONTHLY ? 'month' : 'year'
          }
        };

  const { id: stripePriceId } = await stripe.prices.create(
    {
      ...recurring,
      currency: 'usd',
      product: stripeProductId,
      unit_amount: amount
    },
    { stripeAccount: stripeAccountId }
  );

  wrap(type).assign({ stripePriceId, stripeProductId });
};

/**
 * Creates the corresponding Stripe products and prices for every MemberType
 * that isn't free. Updates the MemberType entity as well.
 */
export default async ({
  stripeAccountId,
  types
}: CreateStripeProductsParams) => {
  await Promise.all(
    types.map(async (entity: MemberType) =>
      createStripeProduct({ stripeAccountId, type: entity })
    )
  );
};
