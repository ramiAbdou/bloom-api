import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberPayment from '@entities/member-payment/MemberPayment';
import User from '@entities/user/User';
import { EmailContext } from '../emails.types';

export interface PaymentReceiptEmailContext {
  card: Stripe.PaymentMethod.Card;
  paymentId: string;
  stripeAccountId: string;
}

export interface PaymentReceiptEmailVars {
  card: Stripe.PaymentMethod.Card;
  community: Community;
  payment: MemberPayment;
  user: User;
}

const preparePaymentReceiptVars = async (
  context: EmailContext
): Promise<PaymentReceiptEmailVars[]> => {
  const {
    card,
    paymentId,
    stripeAccountId
  } = context as PaymentReceiptEmailContext;

  const bm = new BloomManager();

  const [community, payment]: [Community, MemberPayment] = await Promise.all([
    bm.findOne(Community, { integrations: { stripeAccountId } }),
    bm.findOne(MemberPayment, { id: paymentId })
  ]);

  const user: User = await bm.findOne(
    User,
    { members: { id: payment.member.id } },
    { fields: ['email', 'firstName'] }
  );

  card.brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1);

  const variables: PaymentReceiptEmailVars[] = [
    { card, community, payment, user }
  ];

  return variables;
};

export default preparePaymentReceiptVars;
