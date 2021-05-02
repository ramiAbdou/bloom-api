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
      emailEvent: EmailEvent.ACCEPTED_INTO_COMMUNITY;
      emailPayload: AcceptedIntoCommunityPayload;
    }
  | {
      emailEvent: EmailEvent.APPLY_TO_COMMUNITY;
      emailPayload: ApplyToCommunityPayload;
    }
  | {
      emailEvent: EmailEvent.APPLY_TO_COMMUNITY_ADMINS;
      emailPayload: ApplyToCommunityAdminsPayload;
    }
  | {
      emailEvent: EmailEvent.CREATE_EVENT_COORDINATOR;
      emailPayload: CreateEventCoordinatorPayload;
    }
  | {
      emailEvent: EmailEvent.DELETE_EVENT_COORDINATOR;
      emailPayload: DeleteEventCoordinatorPayload;
    }
  | {
      emailEvent: EmailEvent.DELETE_EVENT_GUESTS;
      emailPayload: DeleteEventGuestsPayload;
    }
  | {
      emailEvent: EmailEvent.DELETE_MEMBERS;
      emailPayload: DeleteMembersPayload;
    }
  | {
      emailEvent: EmailEvent.DEMOTE_MEMBERS;
      emailPayload: DemoteMembersPayload;
    }
  | {
      emailEvent: EmailEvent.EVENT_REMINDER;
      emailPayload: EventReminderPayload;
    }
  | {
      emailEvent: EmailEvent.EVENT_RSVP;
      emailPayload: EventRsvpPayload;
    }
  | {
      emailEvent: EmailEvent.INVITE_MEMBERS;
      emailPayload: InviteMembersPayload;
    }
  | {
      emailEvent: EmailEvent.LOGIN_LINK;
      emailPayload: LoginLinkEmailPayload;
    }
  | {
      emailEvent: EmailEvent.PROMOTE_MEMBERS;
      emailPayload: PromoteMembersPayload;
    };
