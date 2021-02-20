import Stripe from 'stripe';

import User from '@entities/user/User';
import Community from '../../entities/community/Community';
import MemberPayment from '../../entities/member-payment/MemberPayment';
import Member from '../../entities/member/Member';
import BloomManager from '../db/BloomManager';
import { FormatPersonalizationData } from './emails.types';
import formatPersonalizations from './formatPersonalizations';

export interface PaymentReceiptContext {
  card: Stripe.PaymentMethod.Card;
  paymentId: string;
  stripeAccountId: string;
}

export interface PaymentReceiptVars {
  card: Stripe.PaymentMethod.Card;
  community: Community;
  payment: MemberPayment;
  user: User;
}

const preparePaymentReceiptEmail = async ({
  card,
  paymentId,
  stripeAccountId
}: PaymentReceiptContext): Promise<FormatPersonalizationData[]> => {
  const bm = new BloomManager();

  const [community, payment]: [Community, MemberPayment] = await Promise.all([
    bm.findOne(Community, { integrations: { stripeAccountId } }),
    bm.findOne(MemberPayment, { id: paymentId })
  ]);

  const member: Member = await bm.findOne(
    Member,
    { id: payment.member.id },
    { populate: ['user'] }
  );

  card.brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1);

  const variables: PaymentReceiptVars[] = [
    { card, community, payment, user: member.user }
  ];

  return formatPersonalizations(variables);
};

export default preparePaymentReceiptEmail;
