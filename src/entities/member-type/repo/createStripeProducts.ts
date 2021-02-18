import Stripe from 'stripe';

import { RecurrenceType } from '@entities/member-type/MemberType.types';
import { stripe } from '@integrations/stripe/Stripe.util';
import MemberType from '../MemberType';

type CreateStripeProductArgs = {
  stripeAccountId: string;
  type: MemberType;
};

type CreateStripeProductsArgs = {
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
}: CreateStripeProductArgs) => {
  const { amount, id, name, recurrence } = type;

  // Create the subscription even if the product is LIFETIME fulfilled
  // subscription.
  const { id: stripeProductId } = await stripe.products.create(
    { id, name },
    { stripeAccount: stripeAccountId }
  );

  let recurring: Partial<Stripe.PriceCreateParams> = {};

  if (recurrence !== RecurrenceType.LIFETIME) {
    recurring = {
      recurring: {
        interval: recurrence === RecurrenceType.MONTHLY ? 'month' : 'year'
      }
    };
  }

  const { id: stripePriceId } = await stripe.prices.create(
    {
      ...recurring,
      currency: 'usd',
      product: stripeProductId,
      unit_amount: amount
    },
    { stripeAccount: stripeAccountId }
  );

  type.stripePriceId = stripePriceId;
  type.stripeProductId = stripeProductId;
};

/**
 * Creates the corresponding Stripe products and prices for every MemberType
 * that isn't free. Updates the MemberType entity as well.
 */
const createStripeProducts = async ({
  stripeAccountId,
  types
}: CreateStripeProductsArgs) => {
  await Promise.all(
    types.map(async (type: MemberType) =>
      createStripeProduct({ stripeAccountId, type })
    )
  );
};

export default createStripeProducts;
