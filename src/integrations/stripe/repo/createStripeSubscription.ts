import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface CreateStripeSubscriptionArgs {
  accountId: string;
  customerId: string;
  priceId: string;
}

const createStripeSubscription = async ({
  accountId,
  customerId,
  priceId
}: CreateStripeSubscriptionArgs): Promise<Stripe.Subscription> => {
  const subscription: Stripe.Subscription = await stripe.subscriptions.create(
    {
      customer: customerId,
      expand: ['latest_invoice.payment_intent'],
      items: [{ price: priceId }]
    },
    { idempotencyKey: nanoid(), stripeAccount: accountId }
  );

  return subscription;
};

export default createStripeSubscription;
