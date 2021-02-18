import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

interface CreateAndPayStripeInvoiceArgs {
  customerId: string;
  options: Stripe.RequestOptions;
  priceId: string;
}

const createAndPayStripeInvoice = async ({
  customerId,
  priceId,
  options
}: CreateAndPayStripeInvoiceArgs): Promise<Stripe.Invoice> => {
  await stripe.invoiceItems.create(
    { customer: customerId, price: priceId },
    options
  );

  const invoice: Stripe.Invoice = await stripe.invoices.create(
    { auto_advance: false, customer: customerId },
    options
  );

  const paidInvoice: Stripe.Invoice = await stripe.invoices.pay(
    invoice.id,
    options
  );

  return paidInvoice;
};

export default createAndPayStripeInvoice;
