import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import Payment, { PaymentType } from '../Payment';

interface CreatePaymentArgs {
  invoice: Stripe.Invoice;
  memberTypeId: string;
}

/**
 * Throws an error if the Stripe.Invoice was not paid. Does nothing, otherwise.
 */
const assertCreatePayment = (args: CreatePaymentArgs) => {
  if (args.invoice.status !== 'paid') {
    throw new Error(`Stripe invoice was not paid.`);
  }
};

/**
 * Returns a new Payment.
 *
 * @param args.invoice - Stripe.Invoice.
 * @param args.memberTypeId - ID of the MemberType.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createPayment = async (
  args: CreatePaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { invoice, memberTypeId } = args;
  const { communityId, memberId } = ctx;

  assertCreatePayment(args);

  const payment: Payment = await new BloomManager().createAndFlush(Payment, {
    amount: invoice.amount_paid / 100,
    community: communityId,
    member: memberId,
    memberType: memberTypeId,
    stripeInvoiceId: invoice.id,
    stripeInvoiceUrl: invoice.hosted_invoice_url,
    type: PaymentType.DUES
  });

  return payment;
};

export default createPayment;
