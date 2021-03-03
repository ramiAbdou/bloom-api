import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

interface CreateAndPayStripeInvoiceArgs {
  accountId: string;
  customerId: string;
  priceId: string;
}

const createAndPayStripeInvoice = async ({
  accountId,
  customerId,
  priceId
}: CreateAndPayStripeInvoiceArgs): Promise<Stripe.Invoice> => {
  await stripe.invoiceItems.create(
    { customer: customerId, price: priceId },
    { idempotencyKey: nanoid(), stripeAccount: accountId }
  );

  const invoice: Stripe.Invoice = await stripe.invoices.create(
    { auto_advance: false, customer: customerId },
    { idempotencyKey: nanoid(), stripeAccount: accountId }
  );

  const paidInvoice: Stripe.Invoice = await stripe.invoices.pay(invoice.id, {
    idempotencyKey: nanoid(),
    stripeAccount: accountId
  });

  return paidInvoice;
};

export default createAndPayStripeInvoice;
