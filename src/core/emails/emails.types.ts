import Event from '@entities/event/Event';
import User from '@entities/user/User';
import { EmailEvent } from '@util/events';

export enum EmailRecipientLevel {
  ALL_ADMINS = 'ALL_ADMINS',
  AUTHENTICATED_USER = 'AUTHENTICATED_USER',
  ALL_MEMBERS = 'ALL_MEMBERS',
  COORDINATOR = 'COORDINATOR',
  PUBLIC_USER = 'PUBLIC_USER',
  TARGETED_MEMBERS = 'TARGETED_MEMBERS'
}

export const recipientLevels: Record<EmailEvent, EmailRecipientLevel> = {
  CREATE_EVENT_COORDINATOR: EmailRecipientLevel.COORDINATOR,
  LOGIN_LINK: EmailRecipientLevel.PUBLIC_USER,
  PAYMENT_RECEIPT: EmailRecipientLevel.PUBLIC_USER
};

// ## CREATE EVENT COORDINATOR

export interface CreateEventCoordinatorContext {
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  event: Event;
  user: User;
}

interface CreateEventCoordinatorTemplate {
  context?: CreateEventCoordinatorContext;
  event: EmailEvent.CREATE_EVENT_COORDINATOR;
}

// ## LOGIN LINK

export interface LoginLinkContext {
  email: string;
  loginUrl: string;
}

export interface LoginLinkVars {
  loginUrl: string;
  user: User;
}

interface LoginLinkTemplate {
  context?: LoginLinkContext;
  event: EmailEvent.LOGIN_LINK;
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
  context?: CreateEventCoordinatorContext;
  event: EmailEvent.PAYMENT_RECEIPT;
}

// ## EMAIL CONTEXT

export type EmailContext = CreateEventCoordinatorContext | LoginLinkContext;

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
