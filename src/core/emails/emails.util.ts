import { isProduction } from '@constants';
import { EmailEvent } from '@util/events';
import logger from '@util/logger';
import { splitArrayIntoChunks } from '@util/util';
import { EmailVars, SendEmailsArgs } from './emails.types';
import getConnectIntegrationsVars from './util/getConnectIntegrationsVars';
import getCreateEventCoordinatorVars from './util/getCreateEventCoordinatorVars';
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
      return !!isProduction || vars.user.email === 'rami@bl.community';
    })
    .map((vars: EmailVars) => {
      return { dynamicTemplateData: vars, to: { email: vars.user.email } };
    });
};

export const prepareEmailPersonalizations = async ({
  emailContext,
  emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[][]> => {
  let result: EmailVars[] = [];

  switch (emailEvent) {
    case EmailEvent.CONNECT_INTEGRATIONS:
      result = await getConnectIntegrationsVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      result = await getCreateEventCoordinatorVars(emailContext);
      break;

    case EmailEvent.LOGIN_LINK:
      result = await getLoginLinkVars(emailContext);
      break;

    case EmailEvent.PAYMENT_RECEIPT:
      result = await getPaymentReceiptVars(emailContext);
      break;

    default:
      logger.log({
        error: `Unhandled email event: ${emailEvent}`,
        level: 'ERROR'
      });
  }

  const personalizations = formatPersonalizations(result);
  const chunkedPersonalizations = splitArrayIntoChunks(personalizations, 1000);

  return chunkedPersonalizations;
};

export default prepareEmailPersonalizations;
