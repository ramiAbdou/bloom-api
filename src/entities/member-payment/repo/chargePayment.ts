import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext, INTEGRATIONS } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberPayment from '../MemberPayment';

@ArgsType()
export class ChargePaymentArgs {
  @Field()
  id: string;

  @Field()
  idempotencyKey: string;
}

export default async (
  { id, idempotencyKey }: ChargePaymentArgs,
  { communityId }: GQLContext
) => {
  const bm = new BloomManager();

  const { name } = await bm.findOne(Community, { id: communityId });

  const memberPayment = bm.create(MemberPayment, {
    amount: 1099,
    idempotencyKey
  });

  try {
    const payment = await stripe.paymentIntents.create(
      {
        amount: 1099,
        currency: 'usd',
        description: `${name} Dues`,
        metadata: { idempotencyKey, paymentId: memberPayment.id },
        payment_method: id,
        receipt_email: 'rami@bl.community',
        setup_future_usage: 'off_session',
        statement_descriptor: `${name} Dues`
        // transfer_data: { destination }
      },
      { idempotencyKey }
    );

    console.log(payment);
    return true;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to charge card.');
  }
};
