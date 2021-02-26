import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { PaymentReceiptContext } from '@core/emails/util/getPaymentReceiptVars';
import emitEmailEvent from '@core/events/emitEmailEvent';
import { Community, Member, MemberPayment } from '@entities/entities';
import createMemberPayment from '@entities/member-payment/repo/createMemberPayment';
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
      { invoice, typeId: member.type.id },
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
  } as PaymentReceiptContext);
};

export default handleInvoicePaid;
