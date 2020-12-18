import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberPayment from '../MemberPayment';
import { MemberPaymentStatus } from '../MemberPayment.types';

@ArgsType()
export class ConfirmPaymentIntentArgs {
  @Field()
  paymentIntentId: string;
}

export default async ({ paymentIntentId }: ConfirmPaymentIntentArgs) => {
  await new BloomManager().findOneAndUpdate(
    MemberPayment,
    { stripePaymentIntentId: paymentIntentId },
    { status: MemberPaymentStatus.FULLFILLED },
    { event: 'STRIPE_PAYMENT_CONFIRMED' }
  );
};
