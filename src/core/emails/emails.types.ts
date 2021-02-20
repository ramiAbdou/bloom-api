import { EmailEvent } from '@util/events';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars
} from './util/prepareCreateEventCoordinatorVars';
import { LoginLinkContext, LoginLinkVars } from './util/prepareLoginLinkVars';
import {
  PaymentReceiptContext,
  PaymentReceiptVars
} from './util/preparePaymentReceiptVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export type EmailsContext =
  | CreateEventCoordinatorContext
  | LoginLinkContext
  | PaymentReceiptContext;

export type EmailsVars =
  | CreateEventCoordinatorVars
  | LoginLinkVars
  | PaymentReceiptVars;

export interface EmailsArgs {
  emailContext: EmailsContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailsArgs;
