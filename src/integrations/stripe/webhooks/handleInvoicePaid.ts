import day, { Dayjs } from 'dayjs';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import sendEmail from '@core/emails/sendEmail';
import { EmailTemplate, PaymentReceiptVars } from '@core/emails/types';
import { Community, Member } from '@entities/entities';
import { stripe } from '../Stripe.util';

export default async function handleInvoicePaid(event: Stripe.Event) {
  const stripeAccountId: string = event.account;
  const invoice = event.data.object as Stripe.Invoice;

  const {
    amount_paid: amountPaid,
    id: stripeInvoiceId,
    subscription
  } = invoice;

  const stripeCustomerId = invoice.customer as string;
  const stripeChargeId = invoice.charge as string;

  const charge: Stripe.Charge = await stripe.charges.retrieve(stripeChargeId, {
    stripeAccount: stripeAccountId
  });

  const { brand: cardCompany, last4 } = charge.payment_method_details.card;

  const bm = new BloomManager();

  const [community, member]: [Community, Member] = await Promise.all([
    bm.findOne(Community, { integrations: { stripeAccountId } }),
    bm.findOne(Member, { stripeCustomerId }, { populate: ['user'] })
  ]);

  // Retrieves the next invoice date for the current subscription.
  const {
    current_period_end: nextInvoiceDate
  } = await stripe.subscriptions.retrieve(subscription as string, {
    stripeAccount: stripeAccountId
  });

  // Format the current invoice payment date, as well as the next invoice date.
  // Date comes as (s), so need to convert to (ms) for Day.js.
  const paymentDate: Dayjs = day.utc(event.created * 1000);
  const renewalDate: Dayjs = day.utc(nextInvoiceDate * 1000);

  const { firstName, email } = member.user;

  const emailOpts: PaymentReceiptVars = {
    amount: amountPaid / 100,
    cardCompany: cardCompany.charAt(0).toUpperCase() + cardCompany.slice(1),
    communityName: community.name,
    firstName,
    last4,
    paymentDate: paymentDate.format('MMMM D, YYYY'),
    paymentDateAndTime: paymentDate
      .tz('America/New_York')
      .format('MMMM D, YYYY @ h:mm A z'),
    renewalDate: renewalDate.format('MMMM D, YYYY'),
    stripeInvoiceId
  };

  await sendEmail({
    template: EmailTemplate.PAYMENT_RECEIPT,
    to: email,
    variables: emailOpts
  });
}
