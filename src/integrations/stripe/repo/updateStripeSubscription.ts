import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

export interface UpdateStripeSubscriptionArgs {
  prorationDate: number;
  stripeAccountId: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
}

/**
 * Returns the updated Stripe.Subscription.
 *
 * @param args.prorationDate UTC timestamp of the proration date.
 * @param args.stripeAccountId - ID of the Stripe.Account.
 * @param args.stripePriceId - ID of the Stripe.Price.
 * @param args.stripeSubscriptionId - ID of the Stripe.Subscription
 *
 * @see https://stripe.com/docs/billing/subscriptions/upgrade-downgrade
 */
const updateStripeSubscription = async (
  args: UpdateStripeSubscriptionArgs
): Promise<Stripe.Subscription> => {
  const {
    stripeAccountId,
    stripePriceId,
    prorationDate,
    stripeSubscriptionId
  } = args;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  // We want to update the current Stripe.Subsciption item that we've already
  // subscribed to, to the new stripePriceId, as opposed to creating an
  // entirely different subscription.
  const subscriptionItems: Stripe.SubscriptionUpdateParams.Item[] = [
    { id: subscription.items.data[0].id, price: stripePriceId }
  ];

  const updatedSubscription: Stripe.Subscription = await stripe.subscriptions.update(
    stripeSubscriptionId,
    {
      items: subscriptionItems,
      proration_behavior: 'always_invoice',
      proration_date: prorationDate
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return updatedSubscription;
};

export default updateStripeSubscription;
