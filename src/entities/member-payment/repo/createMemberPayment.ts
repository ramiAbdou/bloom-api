import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import MemberPayment from '../MemberPayment';

interface CreateMemberPaymentArgs {
  invoice: Stripe.Invoice;
  planId: string;
}

/**
 * Creates MemberPayment record if the subscription was successful and is now
 * active. All other invoices should be handled via webhooks, except for this
 * initial time, since we want to update our UI immediately.
 */
const createMemberPayment = async (
  { invoice, planId }: CreateMemberPaymentArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  const bm = new BloomManager();
  const member: Member = await bm.findOne(Member, { id: memberId });

  // Only if the subscription worked should the MemberPayment be created.

  member.isDuesActive = true;
  member.plan.id = planId;

  let payment: MemberPayment = null;

  if (invoice.status === 'paid' && invoice.amount_paid) {
    payment = bm.create(MemberPayment, {
      amount: invoice.amount_paid / 100,
      community: communityId,
      member: memberId,
      plan: planId,
      stripeInvoiceId: invoice.id,
      stripeInvoiceUrl: invoice.hosted_invoice_url
    });
  }

  await bm.flush();

  return payment;
};

export default createMemberPayment;
