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

  const updatedSubscription: Stripe.Subscription = await stripe.subscriptions.update(
    stripeSubscriptionId,
    {
      expand: ['latest_invoice.payment_intent'],
      items: [{ id: subscription.items.data[0].id, price: stripePriceId }],
      proration_behavior: 'always_invoice',
      proration_date: prorationDate
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return updatedSubscription;
};

export default updateStripeSubscription;
