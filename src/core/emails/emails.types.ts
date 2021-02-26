import { EmailEvent } from '@util/events';
import {
  AcceptedIntoCommunityPayload,
  AcceptedIntoCommunityVars
} from './util/getAcceptedIntoCommunityVars';
import {
  ApplyToCommunityAdminsPayload,
  ApplyToCommunityAdminsVars
} from './util/getApplyToCommunityAdminsVars';
import {
  ApplyToCommunityPayload,
  ApplyToCommunityVars
} from './util/getApplyToCommunityVars';
import {
  ConnectIntegrationsPayload,
  ConnectIntegrationsVars
} from './util/getConnectIntegrationsVars';
import {
  CreateEventCoordinatorPayload,
  CreateEventCoordinatorVars
} from './util/getCreateEventCoordinatorVars';
import { CreateEventInviteesPayload } from './util/getCreateEventInviteesVars';
import {
  DeleteEventCoordinatorPayload,
  DeleteEventCoordinatorVars
} from './util/getDeleteEventCoordinatorVars';
import {
  DeleteEventGuestsPayload,
  DeleteEventGuestsVars
} from './util/getDeleteEventGuestsVars';
import {
  DeleteMembersPayload,
  DeleteMembersVars
} from './util/getDeleteMembersVars';
import {
  DemoteMembersPayload,
  DemoteMembersVars
} from './util/getDemoteMembersVars';
import { EventRsvpPayload, EventRsvpVars } from './util/getEventRsvpVars';
import {
  InviteMembersPayload,
  InviteMembersVars
} from './util/getInviteMembersVars';
import {
  LoginLinkEmailPayload,
  LoginLinkEmailVars
} from './util/getLoginLinkVars';
import {
  PaymentReceiptPayload,
  PaymentReceiptVars
} from './util/getPaymentReceiptVars';
import {
  PromoteMembersPayload,
  PromoteMembersVars
} from './util/getPromoteMembersVars';

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
  | EventRsvpVars
  | InviteMembersVars
  | LoginLinkEmailVars
  | PaymentReceiptVars
  | PromoteMembersVars;

export interface EmailArgs {
  emailPayload: EmailPayload;
  emailEvent: EmailEvent;
}
