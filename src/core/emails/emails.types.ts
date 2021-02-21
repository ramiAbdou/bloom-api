import { EmailEvent } from '@util/events';
import {
  ConnectIntegrationsEmailContext,
  ConnectIntegrationsEmailVars
} from './util/prepareConnectIntegrationsVars';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars
} from './util/prepareCreateEventCoordinatorVars';
import {
  LoginLinkEmailContext,
  LoginLinkEmailVars
} from './util/prepareLoginLinkVars';
import {
  PaymentReceiptEmailContext,
  PaymentReceiptEmailVars
} from './util/preparePaymentReceiptVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export type EmailsContext =
  | ConnectIntegrationsEmailContext
  | CreateEventCoordinatorContext
  | LoginLinkEmailContext
  | PaymentReceiptEmailContext;

export type EmailsVars =
  | ConnectIntegrationsEmailVars
  | CreateEventCoordinatorVars
  | LoginLinkEmailVars
  | PaymentReceiptEmailVars;

export interface EmailsArgs {
  emailContext: EmailsContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailsArgs;
