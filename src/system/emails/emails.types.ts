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
  CreateEventCoordinatorPayload,
  CreateEventCoordinatorVars
} from './repo/getCreateEventCoordinatorVars';
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
  | CreateEventCoordinatorPayload
  | DeleteEventCoordinatorPayload
  | DeleteEventGuestsPayload
  | DeleteMembersPayload
  | DemoteMembersPayload
  | EventReminderPayload
  | EventRsvpPayload
  | InviteMembersPayload
  | LoginLinkEmailPayload
  | PromoteMembersPayload;

export type EmailVars =
  | AcceptedIntoCommunityVars
  | ApplyToCommunityVars
  | ApplyToCommunityAdminsVars
  | CreateEventCoordinatorVars
  | DeleteEventCoordinatorVars
  | DeleteEventGuestsVars
  | DeleteMembersVars
  | DemoteMembersVars
  | EventReminderVars
  | EventRsvpVars
  | InviteMembersVars
  | LoginLinkEmailVars
  | PromoteMembersVars;

export interface EmailArgs {
  emailPayload: EmailPayload;
  emailEvent: EmailEvent;
}
