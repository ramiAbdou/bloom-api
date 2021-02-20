import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import { RecurrenceType } from '@entities/member-type/MemberType.types';
import { stripe } from '@integrations/stripe/Stripe.util';
import { FlushEvent } from '@util/events';
import MemberType from '../MemberType';

interface CreateStripeProductArgs {
  stripeAccountId: string;
  type: MemberType;
}

/**
 * Updates the MemberType's stripePriceId and stripeProductId for all types
 * that are not free. Calls the Stripe SDK product and price creation methods
 * for the community.
 */
const attachStripeProduct = async ({
  stripeAccountId,
  type
}: CreateStripeProductArgs): Promise<MemberType> => {
  const { amount, id, name, recurrence } = type;

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

  type.stripePriceId = price.id;
  type.stripeProductId = product.id;

  return type;
};

/**
 * Creates the corresponding Stripe products and prices for every MemberType
 * that isn't free. Updates the MemberType entity as well.
 */
const createStripeProducts = async ({
  communityId
}: Pick<GQLContext, 'communityId'>) => {
  const bm = new BloomManager();

  const [integrations, types]: [
    CommunityIntegrations,
    MemberType[]
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.find(MemberType, { community: { id: communityId } })
  ]);

  const updatedTypes: MemberType[] = await Promise.all(
    types.map(async (type: MemberType) => {
      return attachStripeProduct({
        stripeAccountId: integrations.stripeAccountId,
        type
      });
    })
  );

  await bm.flush({ flushEvent: FlushEvent.CREATE_STRIPE_PRODUCTS });
  return updatedTypes;
};

export default createStripeProducts;
