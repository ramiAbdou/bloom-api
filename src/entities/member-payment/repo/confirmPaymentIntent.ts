import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';
import { MemberDuesStatus } from '../../member/Member.types';
import MemberPayment from '../MemberPayment';
import { MemberPaymentStatus } from '../MemberPayment.types';

@ArgsType()
export class ConfirmPaymentIntentArgs {
  @Field()
  paymentIntentId: string;
}

/**
 * Updates the PaymentIntent entity to a status of FULFILLED after the payment
 * is confirmed via the Stripe API (handled in React). We return the member
 * since 2 things could have been updated:
 * - Member's type: user could've changed the type in the payment modal.
 * - Members' duesStatus: if they weren't active before, they will be now!
 */
export default async ({
  paymentIntentId
}: ConfirmPaymentIntentArgs): Promise<Member> => {
  const bm = new BloomManager();

  const payment: MemberPayment = await bm.findOne(
    MemberPayment,
    { stripePaymentIntentId: paymentIntentId },
    { populate: ['type', 'member.type'] }
  );

  const { member, type } = payment;
  wrap(payment).assign({ status: MemberPaymentStatus.FULLFILLED });
  wrap(member).assign({ duesStatus: MemberDuesStatus.ACTIVE, type });
  await bm.flush('STRIPE_PAYMENT_CONFIRMED');

  return member;
};
