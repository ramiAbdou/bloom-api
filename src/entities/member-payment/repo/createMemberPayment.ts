import Stripe from 'stripe';

import { BloomManagerArgs, QueryEvent } from '@constants';
import { MemberDuesStatus } from '@entities/member/Member.types';
import { getPaymentCacheKeys } from '../../../core/cache/cacheUtil';
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
}: CreateMemberPaymentArgs) => {
  const { amount_paid, id, hosted_invoice_url } = invoice;

  // Only if the subscription worked should the MemberPayment be created.

  member.isDuesActive = true;
  member.type = type;

  const payment: MemberPayment =
    invoice.status === 'paid' && amount_paid
      ? bm.create(MemberPayment, {
          amount: amount_paid,
          community: { id: communityId },
          member,
          stripeInvoiceId: id,
          stripeInvoiceUrl: hosted_invoice_url,
          type
        })
      : null;

  await bm.flush({
    cacheKeysToInvalidate: [
      ...getPaymentCacheKeys({ communityId, memberId: member.id }),
      `${QueryEvent.GET_USER}-${member.user.id}`
    ]
  });

  return payment?.member ?? member;
};

export default createMemberPayment;
