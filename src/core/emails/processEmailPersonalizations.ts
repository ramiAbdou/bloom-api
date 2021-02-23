import { isProduction, TEST_EMAILS } from '@constants';
import { EmailEvent } from '@util/events';
import logger from '@util/logger';
import { splitArrayIntoChunks } from '@util/util';
import { EmailVars, SendEmailsArgs } from './emails.types';
import getConnectIntegrationsVars from './util/getConnectIntegrationsVars';
import getCreateEventCoordinatorVars from './util/getCreateEventCoordinatorVars';
import getCreateEventInviteesVars from './util/getCreateEventInviteesVars';
import getEventRsvpVars from './util/getEventRsvpVars';
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
 * @param variables Variables for an email template.
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

export const processEmailPersonalizations = async ({
  emailContext,
  emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[][]> => {
  let vars: EmailVars[] = [];

  switch (emailEvent) {
    case EmailEvent.CONNECT_INTEGRATIONS:
      vars = await getConnectIntegrationsVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      vars = await getCreateEventCoordinatorVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_INVITEES:
      vars = await getCreateEventInviteesVars(emailContext);
      break;

    case EmailEvent.EVENT_RSVP:
      vars = await getEventRsvpVars(emailContext);
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

export default processEmailPersonalizations;