import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Payment, { PaymentType } from '../Payment';

interface CreateDuesPaymentArgs {
  invoice: Stripe.Invoice;
  planId: string;
}

/**
 * Creates Payment record if the subscription was successful and is now
 * active. All other invoices should be handled via webhooks, except for this
 * initial time, since we want to update our UI immediately.
 */
const createDuesPayment = async (
  args: CreateDuesPaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { invoice, planId } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [member, _]: [Member, MemberIntegrations] = await Promise.all([
    bm.findOne(Member, memberId, { populate: ['memberIntegrations'] }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // Only if the subscription worked should the Payment be created.

  member.plan.id = planId;

  let payment: Payment = null;

  if (invoice.status === 'paid' && invoice.amount_paid) {
    payment = bm.create(Payment, {
      amount: invoice.amount_paid / 100,
      community: communityId,
      member,
      plan: planId,
      stripeInvoiceId: invoice.id,
      stripeInvoiceUrl: invoice.hosted_invoice_url,
      type: PaymentType.DUES
    });
  }

  await bm.flush();

  return payment;
};

export default createDuesPayment;
