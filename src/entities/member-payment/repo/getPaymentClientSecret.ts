import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { MemberType } from '@entities/entities';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import User from '../../user/User';

@ArgsType()
export class GetPaymentClientSecretArgs {
  @Field()
  memberTypeId: string;
}

export default async (
  { memberTypeId }: GetPaymentClientSecretArgs,
  { communityId, memberId, userId }: GQLContext
) => {
  const bm = new BloomManager();

  const [{ integrations, name }, { amount }, user] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(MemberType, { id: memberTypeId }),
    bm.findOne(User, { id: userId })
  ]);

  const { email, fullName, stripeCustomerId } = user;

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email,
      name: fullName
    });

    wrap(user).assign({ stripeCustomerId: stripeCustomer.id });
    await bm.flush();
  }

  const idempotencyKey = nanoid();

  try {
    const payment = await stripe.paymentIntents.create(
      {
        amount: amount * 100,
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
