import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface CreateStripeSubscriptionArgs {
  customerId: string;
  options: Stripe.RequestOptions;
  priceId: string;
}

const createStripeSubscription = async ({
  customerId,
  options,
  priceId
}: CreateStripeSubscriptionArgs): Promise<Stripe.Subscription> => {
  const subscription: Stripe.Subscription = await stripe.subscriptions.create(
    {
      customer: customerId,
      expand: ['latest_invoice.payment_intent'],
      items: [{ price: priceId }]
    },
    options
  );

  return subscription;
};

export default createStripeSubscription;
