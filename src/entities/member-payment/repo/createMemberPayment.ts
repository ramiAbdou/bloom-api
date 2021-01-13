import Stripe from 'stripe';

import { BloomManagerArgs, QueryEvent } from '@constants';
import cache from '@core/cache';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import { MemberDuesStatus } from '../../member/Member.types';
import MemberPayment from '../MemberPayment';

interface CreateMemberPaymentArgs extends BloomManagerArgs {
  communityId: string;
  invoice: Stripe.Invoice;
  member: Member;
  type: MemberType;
}

/**
 * Creates MemberPayment record if the subscription was successful and is now
 * active. All other invoices should be handled via webhooks, except for this
 * initial time, since we want to update our UI immediately.
 */
const createMemberPayment = async ({
  bm,
  communityId,
  invoice,
  member,
  type
}: CreateMemberPaymentArgs) => {
  const { amount_paid, id, hosted_invoice_url } = invoice;

  if (invoice.status !== 'paid') return null;

  // Only if the subscription worked should the MemberPayment be created.

  const payment: MemberPayment = bm.create(MemberPayment, {
    amount: amount_paid,
    member,
    stripeInvoiceId: id,
    stripeInvoiceUrl: hosted_invoice_url,
    type
  });

  member.duesStatus = MemberDuesStatus.ACTIVE;
  member.type = type;

  await bm.flush();

  cache.invalidateEntries([
    `${QueryEvent.GET_PAYMENT_HISTORY}-${member.id}`,
    `${QueryEvent.GET_PAYMENTS}-${communityId}`
  ]);

  return payment;
};

export default createMemberPayment;
