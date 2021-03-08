import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

interface CreateStripeCustomerArgs {
  email: string;
  fullName: string;
  stripeAccountId: string;
}

/**
 * Returns the new Stripe.Customer. If a Customer already existed with that
 * email in that account, returns that existing one.
 *
 * @param args.email - Email of the Stripe.Customer.
 * @param args.fullName - Full name of the Stripe.Customer.
 * @param args.stripeAccountId - Stripe account ID to query.
 */
const createStripeCustomer = async (
  args: CreateStripeCustomerArgs
): Promise<Stripe.Customer> => {
  const { email, fullName, stripeAccountId } = args;

  // Need to query the Stripe.Customer by email since we don't have the
  // Stripe customer ID yet. If that Stripe.Customer already exists, let's just
  // use that ID instead of creating a new Stripe.Customer.
  const [existingStripeCustomer]: Stripe.Customer[] = (
    await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: stripeAccountId }
    )
  )?.data;

  if (existingStripeCustomer) return existingStripeCustomer;

  const newStripeCustomer: Stripe.Customer = await stripe.customers.create(
    { email, name: fullName },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return newStripeCustomer;
};

export default createStripeCustomer;
