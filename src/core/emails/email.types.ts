export enum EmailRecipient {
  ALL_ADMINS = 'ALL_ADMINS',
  AUTHENTICATED_USER = 'AUTHENTICATED_USER',
  ALL_MEMBERS = 'ALL_MEMBERS',
  COORDINATOR = 'COORDINATOR',
  PUBLIC_USER = 'PUBLIC_USER',
  TARGETED_MEMBERS = 'TARGETED_MEMBERS'
}

export enum EmailTemplate {
  LOGIN_LINK = 'LOGIN_LINK',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT'
}

type EmailBaseArgs = {
  to: string;
};

// ## PAYMENT RECEIPT

export type PaymentReceiptVars = {
  amount: number;
  cardCompany: string;
  communityName: string;
  firstName: string;
  last4: string;
  paymentDate: string;
  paymentDateAndTime: string;
  renewalDate: string;
  stripeInvoiceId: string;
};

interface PaymentReceiptTemplate extends EmailBaseArgs {
  template: EmailTemplate.PAYMENT_RECEIPT;
  variables: PaymentReceiptVars;
}

// ## LOGIN

export type LoginVars = { firstName: string; loginUrl: string };

interface LoginTemplate extends EmailBaseArgs {
  template: EmailTemplate.LOGIN_LINK;
  variables: LoginVars;
}

export type SendEmailArgs = LoginTemplate | PaymentReceiptTemplate;

// ## EMAIL TEMPLATE FILE MAP

export const emailTemplateFiles: Record<EmailTemplate, string> = {
  LOGIN_LINK: 'login',
  PAYMENT_RECEIPT: 'payment-receipt'
};

// ## EMAIL SUBJECT MAP

export const emailSubjectFns: Record<
  EmailTemplate,
  (...args: any) => string
> = {
  LOGIN_LINK: (): string => 'Your Bloom Login Link',
  PAYMENT_RECEIPT: ({
    communityName
  }: Pick<PaymentReceiptVars, 'communityName'>): string =>
    `${communityName} Membership Payment Invoice`
};
