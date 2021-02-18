import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface UpdateStripeSubscriptionArgs {
  options: Stripe.RequestOptions;
  priceId: string;
  prorationDate: number;
  subscriptionId: string;
}

const updateStripeSubscription = async ({
  options,
  priceId,
  prorationDate,
  subscriptionId
}: UpdateStripeSubscriptionArgs): Promise<Stripe.Subscription> => {
  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    subscriptionId,
    options
  );

  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      expand: ['latest_invoice.payment_intent'],
      items: [{ id: subscription.items.data[0].id, price: priceId }],
      proration_behavior: 'always_invoice',
      proration_date: prorationDate
    },
    options
  );

  return updatedSubscription;
};

export default updateStripeSubscription;
