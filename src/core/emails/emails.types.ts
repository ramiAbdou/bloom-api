import Event from '@entities/event/Event';
import User from '@entities/user/User';
import { EmailEvent } from '@util/events';

// export interface EmailContext {
//   communityId?: string;
//   memberIds?: string;
// }

export enum EmailRecipient {
  ALL_ADMINS = 'ALL_ADMINS',
  AUTHENTICATED_USER = 'AUTHENTICATED_USER',
  ALL_MEMBERS = 'ALL_MEMBERS',
  COORDINATOR = 'COORDINATOR',
  PUBLIC_USER = 'PUBLIC_USER',
  TARGETED_MEMBERS = 'TARGETED_MEMBERS'
}

// ## CREATE EVENT COORDINATOR

export interface CreateEventCoordinatorVars {
  event: Event;
  user: User;
}

interface CreateEventCoordinatorTemplate {
  event: EmailEvent.CREATE_EVENT_COORDINATOR;
  recipientLevel?: EmailRecipient.COORDINATOR;
  variables: LoginLinkVars[];
}

// ## LOGIN LINK

export interface LoginLinkVars {
  loginUrl: string;
  user: User;
}

interface LoginLinkTemplate {
  event: EmailEvent.LOGIN_LINK;
  recipientLevel?: EmailRecipient.PUBLIC_USER;
  variables: LoginLinkVars[];
}

// ## PAYMENT RECEIPT

export interface PaymentReceiptVars {
  amount: number;
  cardCompany: string;
  communityName: string;
  last4: string;
  paymentDate: string;
  paymentDateAndTime: string;
  renewalDate: string;
  stripeInvoiceId: string;
  user: User;
}

interface PaymentReceiptTemplate {
  event: EmailEvent.PAYMENT_RECEIPT;
  recipientLevel?: EmailRecipient.AUTHENTICATED_USER;
  variables: PaymentReceiptVars[];
}

// ## SEND EMAILS VARS

export type SendEmailsVars =
  | CreateEventCoordinatorVars
  | LoginLinkVars
  | PaymentReceiptVars;

// ## SEND EMAILS ARGS

export type SendEmailsArgs =
  | CreateEventCoordinatorTemplate
  | LoginLinkTemplate
  | PaymentReceiptTemplate;
