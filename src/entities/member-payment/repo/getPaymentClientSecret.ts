import { nanoid } from 'nanoid';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import User from '../../user/User';

export default async ({ communityId, memberId, userId }: GQLContext) => {
  const bm = new BloomManager();

  const [{ integrations, name }, user] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(User, { id: userId })
  ]);

  const { email, fullName, stripeCustomerId } = user;

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email,
      name: fullName
    });

    user.stripeCustomerId = stripeCustomer.id;
  }

  const idempotencyKey = nanoid();

  try {
    const payment = await stripe.paymentIntents.create(
      {
        amount: 1099,
        currency: 'usd',
        description: `${name} Dues`,
        metadata: { idempotencyKey, memberId },
        receipt_email: 'rami@bl.community',
        setup_future_usage: 'off_session',
        statement_descriptor: `${name} Dues`
      },
      { idempotencyKey, stripeAccount: integrations.stripeAccountId }
    );

    return payment.client_secret;
  } catch (e) {
    throw new Error('Failed to charge card.');
  }
};
