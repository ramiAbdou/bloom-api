import Stripe from 'stripe';
import { wrap } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Member from '../Member';

/**
 * If the user does not have an associated Stripe customer object, create
 * that object and store it on the user entity.
 *
 * Note: Doesn't flush, just wraps the entity.
 */
const createStripeCustomer = async ({
  memberId
}: Pick<GQLContext, 'memberId'>): Promise<Member> => {
  const bm = new BloomManager();
  const member: Member = await bm.findOne(Member, { id: memberId });

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (member.stripeCustomerId) return member;

  await bm.em.populate(member, ['community.integrations', 'user']);
  const { email, fullName } = member.user;
  const { stripeAccountId } = member.community.integrations;

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
          { stripeAccount: stripeAccountId }
        )
      ).id;

  wrap(member).assign({ stripeCustomerId });
  await bm.flush('STRIPE_CUSTOMER_CREATED');

  return member;
};

export default createStripeCustomer;
