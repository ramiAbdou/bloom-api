import { isProduction } from '@constants';
import { EmailEvent } from '@util/events';
import logger from '@util/logger';
import { splitArrayIntoChunks } from '@util/util';
import { EmailsVars, SendEmailsArgs } from './emails.types';
import prepareConnectIntegrationsVars from './util/prepareConnectIntegrationsVars';
import prepareCreateEventCoordinatorVars from './util/prepareCreateEventCoordinatorVars';
import prepareLoginLinkVars from './util/prepareLoginLinkVars';
import preparePaymentReceiptVars from './util/preparePaymentReceiptVars';

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
  variables: EmailsVars[]
): FormatPersonalizationData[] => {
  return variables
    .filter((vars: EmailsVars) => {
      return !!isProduction || vars.user.email === 'rami@bl.community';
    })
    .map((vars: EmailsVars) => {
      return { dynamicTemplateData: vars, to: { email: vars.user.email } };
    });
};

export const prepareEmailPersonalizations = async ({
  emailContext,
  emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[][]> => {
  let result: EmailsVars[] = [];

  switch (emailEvent) {
    case EmailEvent.CONNECT_INTEGRATIONS:
      result = await prepareConnectIntegrationsVars(emailContext);
      break;

    case EmailEvent.CREATE_EVENT_COORDINATOR:
      result = await prepareCreateEventCoordinatorVars(emailContext);
      break;

    case EmailEvent.LOGIN_LINK:
      result = await prepareLoginLinkVars(emailContext);
      break;

    case EmailEvent.PAYMENT_RECEIPT:
      result = await preparePaymentReceiptVars(emailContext);
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
