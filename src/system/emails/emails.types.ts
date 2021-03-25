import { EmailEvent } from '@util/constants.events';
import {
  AcceptedIntoCommunityPayload,
  AcceptedIntoCommunityVars
} from './repo/getAcceptedIntoCommunityVars';
import {
  ApplyToCommunityAdminsPayload,
  ApplyToCommunityAdminsVars
} from './repo/getApplyToCommunityAdminsVars';
import {
  ApplyToCommunityPayload,
  ApplyToCommunityVars
} from './repo/getApplyToCommunityVars';
import {
  ConnectIntegrationsPayload,
  ConnectIntegrationsVars
} from './repo/getConnectIntegrationsVars';
import {
  CreateEventCoordinatorPayload,
  CreateEventCoordinatorVars
} from './repo/getCreateEventCoordinatorVars';
import { CreateEventInviteesPayload } from './repo/getCreateEventInviteesVars';
import {
  DeleteEventCoordinatorPayload,
  DeleteEventCoordinatorVars
} from './repo/getDeleteEventCoordinatorVars';
import {
  DeleteEventGuestsPayload,
  DeleteEventGuestsVars
} from './repo/getDeleteEventGuestsVars';
import {
  DeleteMembersPayload,
  DeleteMembersVars
} from './repo/getDeleteMembersVars';
import {
  DemoteMembersPayload,
  DemoteMembersVars
} from './repo/getDemoteMembersVars';
import {
  EventReminderPayload,
  EventReminderVars
} from './repo/getEventReminderVars';
import { EventRsvpPayload, EventRsvpVars } from './repo/getEventRsvpVars';
import {
  InviteMembersPayload,
  InviteMembersVars
} from './repo/getInviteMembersVars';
import {
  LoginLinkEmailPayload,
  LoginLinkEmailVars
} from './repo/getLoginLinkVars';
import {
  PaymentReceiptPayload,
  PaymentReceiptVars
} from './repo/getPaymentReceiptVars';
import {
  PromoteMembersPayload,
  PromoteMembersVars
} from './repo/getPromoteMembersVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export type EmailPayload =
  | AcceptedIntoCommunityPayload
  | ApplyToCommunityPayload
  | ApplyToCommunityAdminsPayload
  | ConnectIntegrationsPayload
  | CreateEventCoordinatorPayload
  | CreateEventInviteesPayload
  | DeleteEventCoordinatorPayload
  | DeleteEventGuestsPayload
  | DeleteMembersPayload
  | DemoteMembersPayload
  | EventReminderPayload
  | EventRsvpPayload
  | InviteMembersPayload
  | LoginLinkEmailPayload
  | PaymentReceiptPayload
  | PromoteMembersPayload;

export type EmailVars =
  | AcceptedIntoCommunityVars
  | ApplyToCommunityVars
  | ApplyToCommunityAdminsVars
  | ConnectIntegrationsVars
  | CreateEventCoordinatorVars
  | DeleteEventCoordinatorVars
  | DeleteEventGuestsVars
  | DeleteMembersVars
  | DemoteMembersVars
  | EventReminderVars
  | EventRsvpVars
  | InviteMembersVars
  | LoginLinkEmailVars
  | PaymentReceiptVars
  | PromoteMembersVars;

export interface EmailArgs {
  emailPayload: EmailPayload;
  emailEvent: EmailEvent;
}
