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

export type EmailArgs =
  | {
      event: EmailEvent.ACCEPTED_INTO_COMMUNITY;
      payload: AcceptedIntoCommunityPayload;
    }
  | {
      event: EmailEvent.APPLY_TO_COMMUNITY;
      payload: ApplyToCommunityPayload;
    }
  | {
      event: EmailEvent.APPLY_TO_COMMUNITY_ADMINS;
      payload: ApplyToCommunityAdminsPayload;
    }
  | {
      event: EmailEvent.CREATE_EVENT_COORDINATOR;
      payload: CreateEventCoordinatorPayload;
    }
  | {
      event: EmailEvent.DELETE_EVENT_COORDINATOR;
      payload: DeleteEventCoordinatorPayload;
    }
  | {
      event: EmailEvent.DELETE_EVENT_GUESTS;
      payload: DeleteEventGuestsPayload;
    }
  | {
      event: EmailEvent.DELETE_MEMBERS;
      payload: DeleteMembersPayload;
    }
  | {
      event: EmailEvent.DEMOTE_MEMBERS;
      payload: DemoteMembersPayload;
    }
  | {
      event: EmailEvent.EVENT_REMINDER;
      payload: EventReminderPayload;
    }
  | {
      event: EmailEvent.EVENT_RSVP;
      payload: EventRsvpPayload;
    }
  | {
      event: EmailEvent.INVITE_MEMBERS;
      payload: InviteMembersPayload;
    }
  | {
      event: EmailEvent.LOGIN_LINK;
      payload: LoginLinkEmailPayload;
    }
  | {
      event: EmailEvent.PROMOTE_MEMBERS;
      payload: PromoteMembersPayload;
    };
