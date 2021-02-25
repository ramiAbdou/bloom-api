import { DeleteEventGuestArgs } from '@entities/event-guest/repo/deleteEventGuest';
import { EmailEvent } from '@util/events';
import {
  AcceptedIntoCommunityContext,
  AcceptedIntoCommunityVars
} from './util/getAcceptedIntoCommunityVars';
import {
  ApplyToCommunityAdminsContext,
  ApplyToCommunityAdminsVars
} from './util/getApplyToCommunityAdminsVars';
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
import {
  DeleteMembersContext,
  DeleteMembersVars
} from './util/getDeleteMembersVars';
import { EventRsvpContext, EventRsvpVars } from './util/getEventRsvpVars';
import {
  InviteMembersContext,
  InviteMembersVars
} from './util/getInviteMembersVars';
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
  | AcceptedIntoCommunityContext
  | ApplyToCommunityContext
  | ApplyToCommunityAdminsContext
  | ConnectIntegrationsContext
  | CreateEventCoordinatorContext
  | CreateEventInviteesContext
  | DeleteEventCoordinatorContext
  | DeleteEventGuestArgs
  | DeleteMembersContext
  | EventRsvpContext
  | InviteMembersContext
  | LoginLinkEmailContext
  | PaymentReceiptContext;

export type EmailVars =
  | AcceptedIntoCommunityVars
  | ApplyToCommunityVars
  | ApplyToCommunityAdminsVars
  | ConnectIntegrationsVars
  | CreateEventCoordinatorVars
  | DeleteEventCoordinatorVars
  | DeleteEventGuestsVars
  | DeleteMembersVars
  | EventRsvpVars
  | InviteMembersVars
  | LoginLinkEmailVars
  | PaymentReceiptVars;

export interface EmailArgs {
  emailContext: EmailContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailArgs;
