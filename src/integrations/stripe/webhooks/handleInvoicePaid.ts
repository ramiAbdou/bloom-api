import day, { Dayjs } from 'dayjs';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import { EmailTemplate, PaymentReceiptVars } from '@core/emails/email.types';
import sendEmail from '@core/emails/sendEmail';
import { Community, Member, MemberPayment } from '@entities/entities';
import createMemberPayment from '@entities/member-payment/repo/createMemberPayment';
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
    bm.findOne(
      Member,
      { stripeCustomerId: invoice.customer as string },
      { populate: ['type', 'user'] }
    ),
    bm.findOne(MemberPayment, { stripeInvoiceId: invoice.id })
  ]);

  if (!payment) {
    await createMemberPayment(
      { invoice, typeId: member.type.id },
      { communityId: community.id, memberId: member.id }
    );
  }

  // Retrieves the next invoice date for the current subscription.
  const {
    current_period_end: nextInvoiceDate
  } = await stripe.subscriptions.retrieve(invoice.subscription as string, {
    stripeAccount: stripeAccountId
  });

  // Format the current invoice payment date, as well as the next invoice date.
  // Date comes as (s), so need to convert to (ms) for Day.js.
  const paymentDate: Dayjs = day.utc(event.created * 1000);
  const renewalDate: Dayjs = day.utc(nextInvoiceDate * 1000);

  const stripeChargeId = invoice.charge as string;

  const charge: Stripe.Charge = await stripe.charges.retrieve(stripeChargeId, {
    stripeAccount: stripeAccountId
  });

  const { brand: cardCompany, last4 } = charge.payment_method_details.card;

  const emailOpts: PaymentReceiptVars = {
    amount: invoice.amount_paid / 100,
    cardCompany: cardCompany.charAt(0).toUpperCase() + cardCompany.slice(1),
    communityName: community.name,
    firstName: member.user.firstName,
    last4,
    paymentDate: paymentDate.format('MMMM D, YYYY'),
    paymentDateAndTime: paymentDate
      .tz('America/New_York')
      .format('MMMM D, YYYY @ h:mm A z'),
    renewalDate: renewalDate.format('MMMM D, YYYY'),
    stripeInvoiceId: invoice.id
  };

  await sendEmail({
    template: EmailTemplate.PAYMENT_RECEIPT,
    to: member.user.email,
    variables: emailOpts
  });
};

export default handleInvoicePaid;
