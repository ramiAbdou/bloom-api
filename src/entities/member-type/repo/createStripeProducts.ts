import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { assign } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberType, { RecurrenceType } from '@entities/member-type/MemberType';
import { stripe } from '@integrations/stripe/Stripe.util';

interface CreateStripeProductArgs {
  memberType: MemberType;
  stripeAccountId: string;
}

/**
 * Updates the MemberType's stripePriceId and stripeProductId for all types
 * that are not free. Calls the Stripe SDK product and price creation methods
 * for the community.
 */
const attachStripeProduct = async (
  args: CreateStripeProductArgs
): Promise<MemberType> => {
  const { memberType, stripeAccountId } = args;
  const { amount, id, name, recurrence } = memberType;

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

  const updatedMemberType: MemberType = assign(memberType, {
    stripePriceId: price.id,
    stripeProductId: product.id
  });

  return updatedMemberType;
};

interface CreateStripeProductsArgs {
  urlName: string;
}

/**
 * Creates the corresponding Stripe products and prices for every MemberType
 * that isn't free. Updates the MemberType entity as well.
 */
const createStripeProducts = async (
  args: CreateStripeProductsArgs
): Promise<MemberType[]> => {
  const { urlName } = args;

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, memberTypes]: [
    CommunityIntegrations,
    MemberType[]
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { urlName } }),
    bm.find(MemberType, { community: { urlName } })
  ]);

  const updatedMemberTypes: MemberType[] = await Promise.all(
    memberTypes.map(async (memberType: MemberType) => {
      return attachStripeProduct({
        memberType,
        stripeAccountId: communityIntegrations.stripeAccountId
      });
    })
  );

  await bm.flush();

  return updatedMemberTypes;
};

export default createStripeProducts;
