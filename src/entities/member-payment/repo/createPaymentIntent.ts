import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import User from '../../user/User';

@ArgsType()
export class CreatePaymentIntentArgs {
  @Field({ nullable: true })
  memberTypeId: string;
}

export default async (
  { memberTypeId }: CreatePaymentIntentArgs,
  { communityId, memberId, userId }: GQLContext
) => {
  const bm = new BloomManager();

  const [{ integrations, name }, member, type, user] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId }),
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

  if (type) member.type = type;

  try {
    const payment = await stripe.paymentIntents.create(
      {
        amount: type.amount * 100,
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
