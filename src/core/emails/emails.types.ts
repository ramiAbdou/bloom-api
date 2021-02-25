import { DeleteEventGuestArgs } from '@entities/event-guest/repo/deleteEventGuest';
import { EmailEvent } from '@util/events';
import {
  ApplyToCommunityContext,
  ApplyToCommunityVars
} from './util/getApplyToCommunityVars';
import {
  ConnectIntegrationsContext,
  ConnectIntegrationsVars
} from './util/getConnectIntegrationsVars';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars
} from './util/getCreateEventCoordinatorVars';
import { CreateEventInviteesContext } from './util/getCreateEventInviteesVars';
import {
  DeleteEventCoordinatorContext,
  DeleteEventCoordinatorVars
} from './util/getDeleteEventCoordinatorVars';
import { DeleteEventGuestsVars } from './util/getDeleteEventGuestsVars';
import { EventRsvpContext, EventRsvpVars } from './util/getEventRsvpVars';
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
  | ApplyToCommunityContext
  | ConnectIntegrationsContext
  | CreateEventCoordinatorContext
  | CreateEventInviteesContext
  | DeleteEventCoordinatorContext
  | DeleteEventGuestArgs
  | EventRsvpContext
  | LoginLinkEmailContext
  | PaymentReceiptContext;

export type EmailVars =
  | ApplyToCommunityVars
  | ConnectIntegrationsVars
  | CreateEventCoordinatorVars
  | DeleteEventCoordinatorVars
  | DeleteEventGuestsVars
  | EventRsvpVars
  | LoginLinkEmailVars
  | PaymentReceiptVars;

export interface EmailArgs {
  emailContext: EmailContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailArgs;
