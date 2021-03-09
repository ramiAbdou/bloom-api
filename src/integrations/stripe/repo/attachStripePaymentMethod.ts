import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { stripe } from '../Stripe.util';

interface AttachStripePaymentMethodArgs {
  stripeAccountId: string;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
}

/**
 * Returns the updated Stripe.Customer after attaching the given PaymentMethod
 * to the Customer and making it the default PaymentMethod.
 *
 * @param args.stripeAccountId - ID of the Stripe Account.
 * @param args.stripeCustomerId - ID of the Stripe Customer.
 * @param args.stripePaymentMethodId - ID of the Stripe PaymentMethod.
 */
const attachStripePaymentMethod = async (
  args: AttachStripePaymentMethodArgs
): Promise<Stripe.Customer> => {
  const { stripeAccountId, stripeCustomerId, stripePaymentMethodId } = args;

  // Attaches the PaymentMethod to the customer.
  await stripe.paymentMethods.attach(
    stripePaymentMethodId,
    { customer: stripeCustomerId },
    {
      idempotencyKey: nanoid(),
      stripeAccount: stripeAccountId
    }
  );

  // Sets the PaymentMethod to be the default method for the customer. Will
  // be used in future subscription payments.
  const stripeCustomer: Stripe.Customer = await stripe.customers.update(
    stripeCustomerId,
    { invoice_settings: { default_payment_method: stripePaymentMethodId } },
    {
      idempotencyKey: nanoid(),
      stripeAccount: stripeAccountId
    }
  );

  return stripeCustomer;
};

export default attachStripePaymentMethod;
