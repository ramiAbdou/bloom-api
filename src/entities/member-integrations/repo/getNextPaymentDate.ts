import day from 'dayjs';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import MemberIntegrations from '../MemberIntegrations';

const getNextPaymentDate = async (memberId: string): Promise<string> => {
  const { member, stripeSubscriptionId } = await new BloomManager().findOne(
    MemberIntegrations,
    { member: memberId },
    { populate: ['member.community.integrations'] }
  );

  if (!stripeSubscriptionId) return null;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { stripeAccount: member.community.integrations.stripeAccountId }
  );

  return day.utc(subscription?.current_period_end).format();
};

export default getNextPaymentDate;
