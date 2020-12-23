export interface EmailAttachment {
  content: any;
  filename: string;
  type: 'application/pdf';
  disposition: 'attachment';
}

export enum EmailTemplate {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT'
}
type EmailBaseArgs = {
  attachments?: EmailAttachment[];
  to: string;
};

type ApplicationReceivedVars = { firstName: string };

interface ApplicationReceivedTemplate extends EmailBaseArgs {
  template: EmailTemplate.APPLICATION_RECEIVED;
  variables: ApplicationReceivedVars;
}

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

// Maps the enum value to the file name where the template exists.
export const emailTemplateFiles: Record<EmailTemplate, string> = {
  APPLICATION_RECEIVED: 'application-received',
  PAYMENT_RECEIPT: 'payment-receipt'
};

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
