import User from '../../entities/user/User';

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

// ## BASE EMAIL VARS

interface BaseEmailVars {
  user: User;
}

// ## LOGIN LINK

export interface LoginLinkVars extends BaseEmailVars {
  loginUrl: string;
}

interface LoginLinkTemplate {
  template: EmailTemplate.LOGIN_LINK;
  variables: LoginLinkVars[];
}

// ## PAYMENT RECEIPT

export interface PaymentReceiptVars extends BaseEmailVars {
  amount: number;
  cardCompany: string;
  communityName: string;
  last4: string;
  paymentDate: string;
  paymentDateAndTime: string;
  renewalDate: string;
  stripeInvoiceId: string;
}

interface PaymentReceiptTemplate {
  template: EmailTemplate.PAYMENT_RECEIPT;
  variables: PaymentReceiptVars[];
}

// ## SEND EMAILS VARS

export type SendEmailsVars = LoginLinkVars | PaymentReceiptVars;

// ## SEND EMAILS ARGS

export type SendEmailsArgs = LoginLinkTemplate | PaymentReceiptTemplate;
