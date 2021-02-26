import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import Member from '../Member';

/**
 * If the user does not have an associated Stripe customer object, create
 * that object and store it on the user entity.
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

  const { stripeAccountId } = member.community.integrations;

  const existingStripeCustomers: Stripe.Customer[] = (
    await stripe.customers.list(
      { email: member.user.email, limit: 1 },
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
          { email: member.user.email, name: member.user.fullName },
          { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
        )
      ).id;

  member.stripeCustomerId = stripeCustomerId;
  await bm.flush({ flushEvent: FlushEvent.CREATE_STRIPE_CUSTOMER });

  return member;
};

export default createStripeCustomer;
