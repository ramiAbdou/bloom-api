import day from 'dayjs';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Member from '../Member';

const getNextPaymentDate = async (memberId: string) => {
  const { community, stripeSubscriptionId } = await new BloomManager().findOne(
    Member,
    { id: memberId },
    { populate: ['community.integrations'] }
  );

  if (!stripeSubscriptionId) return null;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    community.integrations.stripeOptions()
  );

  return day.utc(subscription?.current_period_end);
};

export default getNextPaymentDate;
