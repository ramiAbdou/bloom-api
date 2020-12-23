import Stripe from 'stripe';

import { INTEGRATIONS } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { PaymentReceiptVars } from '@core/emails/types';
import MemberPayment from '../../entities/member-payment/MemberPayment';

export const stripe = new Stripe(INTEGRATIONS.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  typescript: true
});

interface HandleInvoicePaidArgs {
  amount: number;
  invoiceId: string;
  invoicePdf: string;
  invoiceUrl: string;
}

// export type PaymentReceiptVars = {
//   amount: number;
//   cardCompany: string;
//   communityName: string;
//   firstName: string;
//   lastFourDigits: number;
//   paymentDate: string;
//   paymentDateAndTime: string;
//   renewalDate: string;
//   stripeInvoiceId: string;
// };

export const handleInvoicePaid = async (event: Stripe.Event) => {
  // const bm = new BloomManager();
  console.log(event);

  // )

  // event.object

  // Look up the customer to get the default

  // const [_, wasFound] = await bm.findOneOrCreate(MemberPayment, {
  //   amount,
  //   stripeInvoiceId: invoiceId
  // });

  // if (!wasFound) await bm.flush();

  // const emailOpts: PaymentReceiptVars = {
  //   // firstName
  // };

  // await
};
