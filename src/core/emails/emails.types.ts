import { EmailEvent } from '@util/events';
import {
  ConnectIntegrationsContext,
  ConnectIntegrationsVars
} from './util/getConnectIntegrationsVars';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars
} from './util/getCreateEventCoordinatorVars';
import { CreateEventInviteesContext } from './util/getCreateEventInviteesVars';
import { GetEventRsvpContext, GetEventRsvpVars } from './util/getEventRsvpVars';
import {
  LoginLinkEmailContext,
  LoginLinkEmailVars
} from './util/getLoginLinkVars';
import {
  PaymentReceiptContext,
  PaymentReceiptVars
} from './util/getPaymentReceiptVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export type EmailContext =
  | ConnectIntegrationsContext
  | CreateEventCoordinatorContext
  | CreateEventInviteesContext
  | GetEventRsvpContext
  | LoginLinkEmailContext
  | PaymentReceiptContext;

export type EmailVars =
  | ConnectIntegrationsVars
  | CreateEventCoordinatorVars
  | GetEventRsvpVars
  | LoginLinkEmailVars
  | PaymentReceiptVars;

export interface EmailArgs {
  emailContext: EmailContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailArgs;
