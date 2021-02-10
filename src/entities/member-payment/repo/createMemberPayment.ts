import Stripe from 'stripe';

import { BloomManagerArgs, QueryEvent } from '@constants';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
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
}: CreateMemberPaymentArgs): Promise<MemberPayment> => {
  const { amount_paid, id, hosted_invoice_url } = invoice;

  // Only if the subscription worked should the MemberPayment be created.

  member.isDuesActive = true;
  member.type = type;

  let payment: MemberPayment = null;

  if (invoice.status === 'paid' && amount_paid) {
    payment = bm.create(MemberPayment, {
      amount: amount_paid,
      community: { id: communityId },
      member,
      stripeInvoiceId: id,
      stripeInvoiceUrl: hosted_invoice_url,
      type
    });
  }

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`,
      `${QueryEvent.GET_DATABASE}-${communityId}`,
      `${QueryEvent.GET_MEMBER_PAYMENTS}-${member.id}`,
      `${QueryEvent.GET_PAYMENTS}-${communityId}`,
      `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${communityId}`,
      `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${communityId}`,
      `${QueryEvent.GET_TOTAL_DUES_SERIES}-${communityId}`,
      `${QueryEvent.GET_USER}-${member.user.id}`
    ]
  });

  return payment;
};

export default createMemberPayment;
