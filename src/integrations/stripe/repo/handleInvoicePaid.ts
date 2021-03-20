import { PaymentReceiptPayload } from 'src/system/emails/util/getPaymentReceiptVars';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';
import Payment from '@entities/payment/Payment';
import createPayment from '@entities/payment/repo/createPayment';
import { emitEmailEvent } from '@system/eventBus';
import { EmailEvent } from '@util/constants.events';
import { stripe } from '../Stripe.util';

/**
 * Handles a paid Stripe invoice by sending an email confirmation and if there
 * isn't a Payment stored yet,
 *
 * @param event - Stripe.Event to handle: 'invoice.paid'.
 */
const handleInvoicePaid = async (event: Stripe.Event) => {
  const stripeAccountId: string = event.account;
  const invoice = event.data.object as Stripe.Invoice;

  const bm = new BloomManager();

  const [community, member, payment]: [
    Community,
    Member,
    Payment
  ] = await Promise.all([
    bm.findOne(Community, { communityIntegrations: { stripeAccountId } }),
    bm.findOne(
      Member,
      { memberIntegrations: { stripeCustomerId: invoice.customer as string } },
      { populate: ['memberIntegrations'] }
    ),
    bm.findOne(Payment, { stripeInvoiceId: invoice.id })
  ]);

  let updatedPayment: Payment = payment;

  // If there is no record of a payment in our DB (likely b/c they paid
  // somewhere else other than our website, like Stripe hosted website).
  if (!payment) {
    updatedPayment = await createPayment(
      { invoice, planId: member.plan.id },
      { communityId: community.id, memberId: member.id }
    );
  }

  const method: Stripe.PaymentMethod = await stripe.paymentMethods.retrieve(
    member.memberIntegrations.stripePaymentMethodId,
    { stripeAccount: stripeAccountId }
  );

  emitEmailEvent(EmailEvent.PAYMENT_RECEIPT, {
    card: method.card,
    paymentId: updatedPayment.id,
    stripeAccountId
  } as PaymentReceiptPayload);
};

export default handleInvoicePaid;
