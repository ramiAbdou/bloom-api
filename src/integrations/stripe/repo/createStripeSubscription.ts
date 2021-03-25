import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface CreateStripeSubscriptionArgs {
  stripeAccountId: string;
  stripeCustomerId: string;
  stripePriceId: string;
}

/**
 * Returns the new Stripe.Subscription.
 *
 * @param args.stripeAccountId - ID of the Stripe Account.
 * @param args.stripeCustomerId - ID of the Stripe Customer.
 * @param args.stripePriceId - ID of the Stripe Price.
 */
const createStripeSubscription = async (
  args: CreateStripeSubscriptionArgs
): Promise<Stripe.Subscription> => {
  const { stripeAccountId, stripeCustomerId, stripePriceId } = args;

  // We want to subscribe to the "item" with the given stripePriceId.
  const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [
    { price: stripePriceId }
  ];

  const subscription: Stripe.Subscription = await stripe.subscriptions.create(
    { customer: stripeCustomerId, items: subscriptionItems },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return subscription;
};

export default createStripeSubscription;
