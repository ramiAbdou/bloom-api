import day from 'dayjs';

import { EmailEvent } from '@util/constants.events';
import { splitArrayIntoChunks } from '@util/util';
import { EmailArgs, EmailVars } from './emails.types';
import getAcceptedIntoCommunityVars from './repo/getAcceptedIntoCommunityVars';
import getApplyToCommunityAdminsVars from './repo/getApplyToCommunityAdminsVars';
import getApplyToCommunityVars from './repo/getApplyToCommunityVars';
import getCreateEventCoordinatorVars from './repo/getCreateEventCoordinatorVars';
import getCreateEventInviteesVars from './repo/getCreateEventInviteesVars';
import getDeleteEventCoordinatorVars from './repo/getDeleteEventCoordinatorVars';
import getDeleteEventGuestsVars from './repo/getDeleteEventGuestsVars';
import getDeleteMembersVars from './repo/getDeleteMembersVars';
import getDemoteMembersVars from './repo/getDemoteMembersVars';
import getEventReminderVars from './repo/getEventReminderVars';
import getEventRsvpVars from './repo/getEventRsvpVars';
import getInviteMembersVars from './repo/getInviteMembersVars';
import getLoginLinkVars from './repo/getLoginLinkVars';
import getPromoteMembersVars from './repo/getPromoteMembersVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the ID of the SendGrid dynamic template to populate with the
 * proper variables, based on the emailEvent.
 *
 * @param emailEvent - Type of EmailEvent.
 */
export const getSendGridTemplateId = (emailEvent: EmailEvent): string => {
  switch (emailEvent) {
    case EmailEvent.ACCEPTED_INTO_COMMUNITY:
      return process.env.SENDGRID_ACCEPTED_INTO_COMMUNITY_TEMPLATE_ID;

    case EmailEvent.APPLY_TO_COMMUNITY:
      return process.env.SENDGRID_APPLY_TO_COMMUNITY_TEMPLATE_ID;

    case EmailEvent.APPLY_TO_COMMUNITY_ADMINS:
      return process.env.SENDGRID_APPLY_TO_COMMUNITY_ADMINS_TEMPLATE_ID;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      return process.env.SENDGRID_CREATE_EVENT_COORDINATOR_TEMPLATE_ID;

    case EmailEvent.CREATE_EVENT_INVITEES:
      return process.env.SENDGRID_CREATE_EVENT_INVITEES_TEMPLATE_ID;

    case EmailEvent.DELETE_EVENT_COORDINATOR:
      return process.env.SENDGRID_DELETE_EVENT_COORDINATOR_TEMPLATE_ID;

    case EmailEvent.DELETE_EVENT_GUESTS:
      return process.env.SENDGRID_DELETE_EVENT_GUESTS_TEMPLATE_ID;

    case EmailEvent.DELETE_MEMBERS:
      return process.env.SENDGRID_DELETE_MEMBERS_TEMPLATE_ID;

    case EmailEvent.DEMOTE_MEMBERS:
      return process.env.SENDGRID_DEMOTE_MEMBERS_TEMPLATE_ID;

    case EmailEvent.EVENT_REMINDER:
      return process.env.SENDGRID_EVENT_REMINDER_TEMPLATE_ID;

    case EmailEvent.EVENT_RSVP:
      return process.env.SENDGRID_EVENT_RSVP_TEMPLATE_ID;

    case EmailEvent.INVITE_MEMBERS:
      return process.env.SENDGRID_INVITE_MEMBERS_TEMPLATE_ID;

    case EmailEvent.LOGIN_LINK:
      return process.env.SENDGRID_LOGIN_LINK_TEMPLATE_ID;

    case EmailEvent.PROMOTE_MEMBERS:
      return process.env.SENDGRID_PROMOTE_MEMBERS_TEMPLATE_ID;

    default:
      return null;
  }
};

/**
 * Returns the dynamic variables that need to be sent to SendGrid to populate
 * the email template.
 *
 * @param args.emailPayload - Payload/context to query the variables for email.
 * @param args.emailEvent - Type of EmailEvent.
 */
const getEmailVars = (args: EmailArgs): Promise<EmailVars[]> => {
  const { emailPayload, emailEvent } = args;

  switch (emailEvent) {
    case EmailEvent.ACCEPTED_INTO_COMMUNITY:
      return getAcceptedIntoCommunityVars(emailPayload);

    case EmailEvent.APPLY_TO_COMMUNITY:
      return getApplyToCommunityVars(emailPayload);

    case EmailEvent.APPLY_TO_COMMUNITY_ADMINS:
      return getApplyToCommunityAdminsVars(emailPayload);

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      return getCreateEventCoordinatorVars(emailPayload);

    case EmailEvent.CREATE_EVENT_INVITEES:
      return getCreateEventInviteesVars(emailPayload);

    case EmailEvent.DELETE_EVENT_COORDINATOR:
      return getDeleteEventCoordinatorVars(emailPayload);

    case EmailEvent.DELETE_EVENT_GUESTS:
      return getDeleteEventGuestsVars(emailPayload);

    case EmailEvent.DELETE_MEMBERS:
      return getDeleteMembersVars(emailPayload);

    case EmailEvent.DEMOTE_MEMBERS:
      return getDemoteMembersVars(emailPayload);

    case EmailEvent.EVENT_REMINDER:
      return getEventReminderVars(emailPayload);

    case EmailEvent.EVENT_RSVP:
      return getEventRsvpVars(emailPayload);

    case EmailEvent.INVITE_MEMBERS:
      return getInviteMembersVars(emailPayload);

    case EmailEvent.LOGIN_LINK:
      return getLoginLinkVars(emailPayload);

    case EmailEvent.PROMOTE_MEMBERS:
      return getPromoteMembersVars(emailPayload);

    default:
      return null;
  }
};

/**
 * Returns the email personalizations according to the EmailEvent.
 *
 * @param args.emailPayload - Context to query the variables for email.
 * @param args.emailEvent - Type of EmailEvent.
 */
export const getPersonalizations = async (
  args: EmailArgs
): Promise<FormatPersonalizationData[][]> => {
  const emailVars: EmailVars[] = await getEmailVars(args);

  const personalizations: FormatPersonalizationData[] = emailVars
    .filter((vars: EmailVars) => {
      return (
        process.env.APP_ENV === 'stage' ||
        process.env.APP_ENV === 'prod' ||
        vars.member.email === process.env.USER_EMAIL ||
        vars.member.email === process.env.USER_SECONDARY_EMAIL
      );
    })
    .map((vars: EmailVars) => {
      return { dynamicTemplateData: vars, to: { email: vars.member.email } };
    });

  const chunkedPersonalizations: FormatPersonalizationData[][] = splitArrayIntoChunks(
    { arr: personalizations, maxChunkSize: 1000 }
  );

  return chunkedPersonalizations;
};

/**
 * Returns the timestamp in the Pacific Timezone. This can either be PDT
 * (-7:00) or PST (-8:00). It should include the 3-letter abbreviation of the
 * timezone in the string for context.
 *
 * Precondition: @param timestamp must be a valid UTC timestring.
 *
 * @param timestamp - UTC timestamp to convert.
 *
 * @example
 * // Returns 'March 25, 2021 at 4:00 PM PDT'.
 * stringifyEmailTimestamp('2021-03-25T23:00:00Z')
 */
export const stringifyEmailTimestamp = (timestamp: string): string => {
  return day(timestamp)
    .tz('America/Los_Angeles')
    .format('MMMM D, YYYY @ h:mm A z');
};
