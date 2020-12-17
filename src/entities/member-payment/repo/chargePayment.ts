import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext, INTEGRATIONS } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';

@ArgsType()
export class ChargePaymentArgs {
  @Field()
  id: string;
}

export default async ({ id }: ChargePaymentArgs, ctx: GQLContext) => {
  console.log(id);

  try {
    const payment = await stripe.paymentIntents.create({
      amount: 1099,
      confirm: true,
      currency: 'usd',
      description: 'Delicious empanadas.',
      payment_method: id
      // transfer_data: { des }
    });

    console.log(payment);
    return true;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to charge card.');
  }
};
