import day, { Dayjs } from 'dayjs';
import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import sendEmail from '@core/emails/sendEmail';
import { EmailTemplate, PaymentReceiptVars } from '@core/emails/types';
import Member from '@entities/member/Member';
import logger from '@logger';
import { stripe } from '../Stripe.util';

export default async function handleInvoicePaid(event: Stripe.Event) {
  const {
    amount_paid: amountPaid,
    customer: stripeCustomerId,
    default_payment_method: paymentMethodId,
    id: stripeInvoiceId,
    metadata,
    subscription
  } = event.data.object as Stripe.Invoice;

  const member: Member = await new BloomManager().findOne(
    Member,
    {
      id: metadata.memberId,
      user: { stripeCustomerId: stripeCustomerId as string }
    },
    { populate: ['community', 'user'] }
  );

  if (!member) {
    const e = new Error(`Couldn't find Member in handleInvoicePaid().`);
    logger.log({ error: e.stack, level: 'ERROR' });
    throw e;
  }

  // Retrieves the next invoice date for the current subscription.
  const {
    current_period_end: nextInvoiceDate
  } = await stripe.subscriptions.retrieve(subscription as string, {
    stripeAccount: event.account
  });

  // Format the current invoice payment date, as well as the next invoice date.
  // Date comes as (s), so need to convert to (ms) for Day.js.
  const paymentDate: Dayjs = day.utc(event.created * 1000);
  const renewalDate: Dayjs = day.utc(nextInvoiceDate * 1000);

  const { card } = await stripe.paymentMethods.retrieve(
    paymentMethodId as string,
    {
      stripeAccount: event.account
    }
  );

  const { firstName, email } = member.user;

  const emailOpts: PaymentReceiptVars = {
    amount: amountPaid / 100,
    cardCompany: card.brand.charAt(0).toUpperCase() + card.brand.slice(1),
    communityName: member.community.name,
    firstName,
    last4: card.last4,
    paymentDate: paymentDate.format('MMMM D, YYYY'),
    paymentDateAndTime: paymentDate
      .tz('America/New_York')
      .format('MMMM D, YYYY @ h:mm a z'),
    renewalDate: renewalDate.format('MMMM D, YYYY'),
    stripeInvoiceId
  };

  await sendEmail({
    template: EmailTemplate.PAYMENT_RECEIPT,
    to: email,
    variables: emailOpts
  });
}
