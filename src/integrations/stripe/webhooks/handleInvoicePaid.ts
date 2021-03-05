import { PaymentReceiptPayload } from 'src/system/emails/util/getPaymentReceiptVars';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberPayment from '@entities/member-payment/MemberPayment';
import createMemberPayment from '@entities/member-payment/repo/createMemberPayment';
import Member from '@entities/member/Member';
import { emitEmailEvent } from '@system/eventBus';
import { EmailEvent } from '@util/events';
import { stripe } from '../Stripe.util';

/**
 * Handles a paid Stripe invoice by sending an email confirmation and if there
 * isn't a MemberPayment stored yet,
 */
const handleInvoicePaid = async (event: Stripe.Event) => {
  const stripeAccountId: string = event.account;
  const invoice = event.data.object as Stripe.Invoice;

  const bm = new BloomManager();

  const [community, member, payment]: [
    Community,
    Member,
    MemberPayment
  ] = await Promise.all([
    bm.findOne(Community, { integrations: { stripeAccountId } }),
    bm.findOne(Member, { stripeCustomerId: invoice.customer as string }),
    bm.findOne(MemberPayment, { stripeInvoiceId: invoice.id })
  ]);

  let updatedPayment: MemberPayment = payment;

  // If there is no record of a payment in our DB (likely b/c they paid
  // somewhere else other than our website, like Stripe hosted website).
  if (!payment) {
    updatedPayment = await createMemberPayment(
      { invoice, planId: member.plan.id },
      { communityId: community.id, memberId: member.id }
    );
  }

  const method: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(
    member.stripePaymentMethodId,
    { stripeAccount: stripeAccountId }
  );

  emitEmailEvent(EmailEvent.PAYMENT_RECEIPT, {
    card: method.card,
    paymentId: updatedPayment.id,
    stripeAccountId
  } as PaymentReceiptPayload);
};

export default handleInvoicePaid;
