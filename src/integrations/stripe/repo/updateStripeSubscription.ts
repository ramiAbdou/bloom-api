import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface UpdateStripeSubscriptionArgs {
  accountId: string;
  priceId: string;
  prorationDate: number;
  subscriptionId: string;
}

const updateStripeSubscription = async (
  args: UpdateStripeSubscriptionArgs
): Promise<Stripe.Subscription> => {
  const { accountId, priceId, prorationDate, subscriptionId } = args;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    subscriptionId,
    { idempotencyKey: nanoid(), stripeAccount: accountId }
  );

  const updatedSubscription: Stripe.Subscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      expand: ['latest_invoice.payment_intent'],
      items: [{ id: subscription.items.data[0].id, price: priceId }],
      proration_behavior: 'always_invoice',
      proration_date: prorationDate
    },
    { idempotencyKey: nanoid(), stripeAccount: accountId }
  );

  return updatedSubscription;
};

export default updateStripeSubscription;
