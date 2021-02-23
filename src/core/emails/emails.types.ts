import { EmailEvent } from '@util/events';
import {
  ConnectIntegrationsEmailContext,
  ConnectIntegrationsEmailVars
} from './util/getConnectIntegrationsVars';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars
} from './util/getCreateEventCoordinatorVars';
import { CreateEventInviteesContext } from './util/getCreateEventInviteesVars';
import {
  LoginLinkEmailContext,
  LoginLinkEmailVars
} from './util/getLoginLinkVars';
import {
  PaymentReceiptEmailContext,
  PaymentReceiptEmailVars
} from './util/getPaymentReceiptVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export type EmailContext =
  | ConnectIntegrationsEmailContext
  | CreateEventCoordinatorContext
  | CreateEventInviteesContext
  | LoginLinkEmailContext
  | PaymentReceiptEmailContext;

export type EmailVars =
  | ConnectIntegrationsEmailVars
  | CreateEventCoordinatorVars
  | LoginLinkEmailVars
  | PaymentReceiptEmailVars;

export interface EmailArgs {
  emailContext: EmailContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailArgs;
