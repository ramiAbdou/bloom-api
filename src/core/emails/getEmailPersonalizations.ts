import { isProduction, TEST_EMAILS } from '@constants';
import { EmailEvent } from '@util/events';
import logger from '@util/logger';
import { splitArrayIntoChunks } from '@util/util';
import { EmailVars, SendEmailsArgs } from './emails.types';
import getAcceptedIntoCommunityVars from './util/getAcceptedIntoCommunityVars';
import getApplyToCommunityAdminsVars from './util/getApplyToCommunityAdminsVars';
import getApplyToCommunityVars from './util/getApplyToCommunityVars';
import getConnectIntegrationsVars from './util/getConnectIntegrationsVars';
import getCreateEventCoordinatorVars from './util/getCreateEventCoordinatorVars';
import getCreateEventInviteesVars from './util/getCreateEventInviteesVars';
import getDeleteEventCoordinatorVars from './util/getDeleteEventCoordinatorVars';
import getDeleteEventGuestsVars from './util/getDeleteEventGuestsVars';
import getEventRsvpVars from './util/getEventRsvpVars';
import getInviteMembersVars from './util/getInviteMembersVars';
import getLoginLinkVars from './util/getLoginLinkVars';
import getPaymentReceiptVars from './util/getPaymentReceiptVars';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * If development environment, filters all personalizations out that aren't
 * going to rami@bl.community.
 *
 * @param {EmailVars[]} variables - Variables for an email template.
 */
const formatPersonalizations = (
  variables: EmailVars[]
): FormatPersonalizationData[] => {
  return variables
    .filter((vars: EmailVars) => {
      return !!isProduction || TEST_EMAILS.includes(vars.user.email);
    })
    .map((vars: EmailVars) => {
      return { dynamicTemplateData: vars, to: { email: vars.user.email } };
    });
};

/**
 * Returns the email personalizations according to the args.emailEvent.
 *
 * @param {EmailContext} args.emailContext
 * @param {EmailEvent} args.emailEvent
 *
 * @returns {FormatPersonalizationData[][]} - Nested array of personalizations.
 */
const getEmailPersonalizations = async (
  args: SendEmailsArgs
): Promise<FormatPersonalizationData[][]> => {
  const { emailContext, emailEvent } = args;

  let vars: EmailVars[] = [];

  switch (emailEvent) {
    case EmailEvent.ACCEPTED_INTO_COMMUNITY:
      vars = await getAcceptedIntoCommunityVars(emailContext);
      break;

    case EmailEvent.APPLY_TO_COMMUNITY:
      vars = await getApplyToCommunityVars(emailContext);
      break;

    case EmailEvent.APPLY_TO_COMMUNITY_ADMINS:
      vars = await getApplyToCommunityAdminsVars(emailContext);
      break;

    case EmailEvent.CONNECT_INTEGRATIONS:
      vars = await getConnectIntegrationsVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      vars = await getCreateEventCoordinatorVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_INVITEES:
      vars = await getCreateEventInviteesVars(emailContext);
      break;

    case EmailEvent.DELETE_EVENT_COORDINATOR:
      vars = await getDeleteEventCoordinatorVars(emailContext);
      break;

    case EmailEvent.DELETE_EVENT_GUESTS:
      vars = await getDeleteEventGuestsVars(emailContext);
      break;

    case EmailEvent.EVENT_RSVP:
      vars = await getEventRsvpVars(emailContext);
      break;

    case EmailEvent.INVITE_MEMBERS:
      vars = await getInviteMembersVars(emailContext);
      break;

    case EmailEvent.LOGIN_LINK:
      vars = await getLoginLinkVars(emailContext);
      break;

    case EmailEvent.PAYMENT_RECEIPT:
      vars = await getPaymentReceiptVars(emailContext);
      break;

    default:
      logger.log({
        error: `Unhandled email event: ${emailEvent}`,
        level: 'ERROR'
      });
  }

  const personalizations = formatPersonalizations(vars);
  const chunkedPersonalizations = splitArrayIntoChunks(personalizations, 1000);

  return chunkedPersonalizations;
};

export default getEmailPersonalizations;
