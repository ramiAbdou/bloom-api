import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import Payment from '@entities/payment/Payment';
import { EmailPayload } from '../emails.types';

export interface PaymentReceiptPayload {
  card: Stripe.PaymentMethod.Card;
  paymentId: string;
  stripeAccountId: string;
}

export interface PaymentReceiptVars {
  card: Stripe.PaymentMethod.Card;
  community: Community;
  payment: Payment;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getPaymentReceiptVars = async (
  context: EmailPayload
): Promise<PaymentReceiptVars[]> => {
  const { card, paymentId, stripeAccountId } = context as PaymentReceiptPayload;

  const bm = new BloomManager();

  const [community, payment]: [Community, Payment] = await Promise.all([
    bm.findOne(Community, { communityIntegrations: { stripeAccountId } }),
    bm.findOne(Payment, paymentId)
  ]);

  const member: Member = await bm.findOne(Member, payment.member.id);

  card.brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1);

  const variables: PaymentReceiptVars[] = [
    {
      card,
      community,
      member: { email: member.email, firstName: member.firstName },
      payment
    }
  ];

  return variables;
};

export default getPaymentReceiptVars;
