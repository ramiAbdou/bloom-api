import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

interface CreateAndPayStripeInvoiceArgs {
  stripeAccountId: string;
  stripeCustomerId: string;
  stripePriceId: string;
}

/**
 * Returns the paid Stripe.Invoice.
 *
 * @param args.stripeAccountId - ID of the Stripe Account.
 * @param args.stripeCustomerId - ID of the Stripe Customer.
 * @param args.stripePriceId - ID of the Stripe Price.
 */
const createAndPayStripeInvoice = async (
  args: CreateAndPayStripeInvoiceArgs
): Promise<Stripe.Invoice> => {
  const { stripeAccountId, stripeCustomerId, stripePriceId } = args;

  await stripe.invoiceItems.create(
    { customer: stripeCustomerId, price: stripePriceId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  const invoice: Stripe.Invoice = await stripe.invoices.create(
    { auto_advance: false, customer: stripeCustomerId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  const paidInvoice: Stripe.Invoice = await stripe.invoices.pay(invoice.id, {
    idempotencyKey: nanoid(),
    stripeAccount: stripeAccountId
  });

  return paidInvoice;
};

export default createAndPayStripeInvoice;
