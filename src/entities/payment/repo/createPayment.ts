import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Payment, { PaymentType } from '../Payment';

interface CreatePaymentArgs {
  invoice: Stripe.Invoice;
  planId: string;
}

/**
 * Throws an error if the Stripe.Invoice was not paid or no money was paid.
 */
const assertCreatePayment = (args: CreatePaymentArgs) => {
  const { invoice } = args;

  if (invoice.status !== 'paid' || !invoice.amount_paid) {
    throw new Error(`Stripe invoice was not paid.`);
  }
};

/**
 * Returns a new Payment.
 *
 * @param args.invoice - Stripe invoice.
 * @param args.planId - ID of the MemberPlan.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createPayment = async (
  args: CreatePaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { invoice, planId } = args;
  const { communityId, memberId } = ctx;

  assertCreatePayment(args);

  const bm = new BloomManager();

  const member: Member = await bm.findOne(Member, memberId, {
    populate: ['memberIntegrations']
  });

  member.plan.id = planId;

  const payment: Payment = bm.create(Payment, {
    amount: invoice.amount_paid / 100,
    community: communityId,
    member,
    plan: planId,
    stripeInvoiceId: invoice.id,
    stripeInvoiceUrl: invoice.hosted_invoice_url,
    type: PaymentType.DUES
  });

  await bm.flush();

  return payment;
};

export default createPayment;
