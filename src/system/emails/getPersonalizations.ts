import logger from '@system/logger/logger';
import { isDevelopment } from '@util/constants';
import { EmailEvent } from '@util/constants.events';
import { splitArrayIntoChunks } from '@util/util';
import { EmailArgs, EmailVars } from './emails.types';
import getAcceptedIntoCommunityVars from './util/getAcceptedIntoCommunityVars';
import getApplyToCommunityAdminsVars from './util/getApplyToCommunityAdminsVars';
import getApplyToCommunityVars from './util/getApplyToCommunityVars';
import getConnectIntegrationsVars from './util/getConnectIntegrationsVars';
import getCreateEventCoordinatorVars from './util/getCreateEventCoordinatorVars';
import getCreateEventInviteesVars from './util/getCreateEventInviteesVars';
import getDeleteEventCoordinatorVars from './util/getDeleteEventCoordinatorVars';
import getDeleteEventGuestsVars from './util/getDeleteEventGuestsVars';
import getDeleteMembersVars from './util/getDeleteMembersVars';
import getDemoteMembersVars from './util/getDemoteMembersVars';
import getEventReminderVars from './util/getEventReminderVars';
import getEventRsvpVars from './util/getEventRsvpVars';
import getInviteMembersVars from './util/getInviteMembersVars';
import getLoginLinkVars from './util/getLoginLinkVars';
import getPaymentReceiptVars from './util/getPaymentReceiptVars';
import getPromoteMembersVars from './util/getPromoteMembersVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * If development environment, filters all personalizations out that aren't
 * going to process.env.USER_EMAIL.
 *
 * @param variables - Variables for an email template.
 */
const formatPersonalizations = (
  variables: EmailVars[]
): FormatPersonalizationData[] => {
  return variables
    .filter((vars: EmailVars) => {
      return !isDevelopment || vars.member.email === process.env.USER_EMAIL;
    })
    .map((vars: EmailVars) => {
      return { dynamicTemplateData: vars, to: { email: vars.member.email } };
    });
};

/**
 * Returns the email personalizations according to the EmailEvent.
 *
 * @param args.emailPayload - Context to query the variables for email.
 * @param args.emailEvent - Type of EmailEvent.
 */
const getPersonalizations = async (
  args: EmailArgs
): Promise<FormatPersonalizationData[][]> => {
  const { emailPayload, emailEvent } = args;

  let vars: EmailVars[] = [];

  switch (emailEvent) {
    case EmailEvent.ACCEPTED_INTO_COMMUNITY:
      vars = await getAcceptedIntoCommunityVars(emailPayload);
      break;

    case EmailEvent.APPLY_TO_COMMUNITY:
      vars = await getApplyToCommunityVars(emailPayload);
      break;

    case EmailEvent.APPLY_TO_COMMUNITY_ADMINS:
      vars = await getApplyToCommunityAdminsVars(emailPayload);
      break;

    case EmailEvent.CONNECT_INTEGRATIONS:
      vars = await getConnectIntegrationsVars(emailPayload);
      break;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      vars = await getCreateEventCoordinatorVars(emailPayload);
      break;

    case EmailEvent.CREATE_EVENT_INVITEES:
      vars = await getCreateEventInviteesVars(emailPayload);
      break;

    case EmailEvent.DELETE_EVENT_COORDINATOR:
      vars = await getDeleteEventCoordinatorVars(emailPayload);
      break;

    case EmailEvent.DELETE_EVENT_GUESTS:
      vars = await getDeleteEventGuestsVars(emailPayload);
      break;

    case EmailEvent.DELETE_MEMBERS:
      vars = await getDeleteMembersVars(emailPayload);
      break;

    case EmailEvent.DEMOTE_MEMBERS:
      vars = await getDemoteMembersVars(emailPayload);
      break;

    case EmailEvent.EVENT_REMINDER:
      vars = await getEventReminderVars(emailPayload);
      break;

    case EmailEvent.EVENT_RSVP:
      vars = await getEventRsvpVars(emailPayload);
      break;

    case EmailEvent.INVITE_MEMBERS:
      vars = await getInviteMembersVars(emailPayload);
      break;

    case EmailEvent.LOGIN_LINK:
      vars = await getLoginLinkVars(emailPayload);
      break;

    case EmailEvent.PAYMENT_RECEIPT:
      vars = await getPaymentReceiptVars(emailPayload);
      break;

    case EmailEvent.PROMOTE_MEMBERS:
      vars = await getPromoteMembersVars(emailPayload);
      break;

    default:
      logger.log({
        error: `Unhandled email event: ${emailEvent}`,
        level: 'ERROR'
      });
  }

  const personalizations = formatPersonalizations(vars);

  const chunkedPersonalizations: FormatPersonalizationData[][] = splitArrayIntoChunks(
    { arr: personalizations, maxChunkSize: 1000 }
  );

  return chunkedPersonalizations;
};

export default getPersonalizations;
