/**
 * @fileoverview Types: Emails
 * - Constructs all of the base email types as well as email-specific types
 * including the variables to replace using the Handlebars templating engine.
 */

export interface EmailAttachment {
  content: any;
  filename: string;
  type: 'application/pdf';
  disposition: 'attachment';
}

type EmailBaseArgs = {
  attachments?: EmailAttachment[];
  to: string;
};

export enum EmailTemplate {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT'
}

// ## APPLICATION RECEIVED

type ApplicationReceivedVars = { firstName: string };

interface ApplicationReceivedTemplate extends EmailBaseArgs {
  template: EmailTemplate.APPLICATION_RECEIVED;
  variables: ApplicationReceivedVars;
}

// ## PAYMENT RECEIPT

export type PaymentReceiptVars = {
  amount: number;
  cardCompany: string;
  communityName: string;
  firstName: string;
  lastFourDigits: number;
  paymentDate: string;
  paymentDateAndTime: string;
  renewalDate: string;
  stripeInvoiceId: string;
};

interface PaymentReceiptTemplate extends EmailBaseArgs {
  template: EmailTemplate.PAYMENT_RECEIPT;
  variables: PaymentReceiptVars;
}

export type SendEmailArgs =
  | ApplicationReceivedTemplate
  | PaymentReceiptTemplate;

// ## EMAIL TEMPLATE FILE MAP

export const emailTemplateFiles: Record<EmailTemplate, string> = {
  APPLICATION_RECEIVED: 'application-received',
  PAYMENT_RECEIPT: 'payment-receipt'
};

// ## EMAIL SUBJECT MAP

export const emailSubjectFns: Record<
  EmailTemplate,
  (...args: any) => string
> = {
  APPLICATION_RECEIVED: () => '',
  PAYMENT_RECEIPT: ({
    communityName
  }: Pick<PaymentReceiptVars, 'communityName'>): string =>
    `${communityName} Membership Payment Invoice`
};
