import Stripe from 'stripe';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';
import MemberPayment from '../MemberPayment';

interface CreateMemberPaymentArgs {
  invoice: Stripe.Invoice;
  typeId: string;
}

/**
 * Creates MemberPayment record if the subscription was successful and is now
 * active. All other invoices should be handled via webhooks, except for this
 * initial time, since we want to update our UI immediately.
 */
const createMemberPayment = async (
  { invoice, typeId }: CreateMemberPaymentArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  const bm = new BloomManager();
  const member: Member = await bm.findOne(Member, { id: memberId });

  // Only if the subscription worked should the MemberPayment be created.

  member.isDuesActive = true;
  member.type.id = typeId;

  let payment: MemberPayment = null;

  if (invoice.status === 'paid' && invoice.amount_paid) {
    payment = bm.create(MemberPayment, {
      amount: invoice.amount_paid,
      community: { id: communityId },
      member,
      stripeInvoiceId: invoice.id,
      stripeInvoiceUrl: invoice.hosted_invoice_url,
      type: { id: typeId }
    });
  }

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${communityId}`,
      `${QueryEvent.GET_DATABASE}-${communityId}`,
      `${QueryEvent.GET_PAYMENTS}-${member.id}`,
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
