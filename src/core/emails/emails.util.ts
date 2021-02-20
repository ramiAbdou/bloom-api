import { isProduction } from '@constants';
import { EmailEvent } from '@util/events';
import logger from '@util/logger';
import { SendEmailsArgs } from './emails.types';
import prepareCreateEventCoordinatorEmail, {
  CreateEventCoordinatorContext
} from './util/prepareCreateEventCoordinatorEmail';
import prepareLoginLinkEmail, {
  LoginLinkContext
} from './util/prepareLoginLinkEmail';
import preparePaymentReceiptEmail, {
  PaymentReceiptContext
} from './util/preparePaymentReceiptEmail';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * @param variables Variables for an email template.
 */
const formatPersonalizations = (
  variables: any[]
): FormatPersonalizationData[] => {
  return variables
    .filter((args: any) => {
      if (isProduction) return true;
      return args.user.email === 'rami@bl.community';
    })
    .map((args: any) => {
      return { dynamicTemplateData: args, to: { email: args.user.email } };
    });
};

export const prepareEmailPersonalizations = async ({
  emailContext,
  emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[]> => {
  let result: any = [];

  switch (emailEvent) {
    case EmailEvent.CREATE_EVENT_COORDINATOR:
      result = await prepareCreateEventCoordinatorEmail(
        emailContext as CreateEventCoordinatorContext
      );

      break;

    case EmailEvent.LOGIN_LINK:
      result = await prepareLoginLinkEmail(emailContext as LoginLinkContext);
      break;

    case EmailEvent.PAYMENT_RECEIPT:
      result = await preparePaymentReceiptEmail(
        emailContext as PaymentReceiptContext
      );

      break;

    default:
      logger.log({
        error: `Unhandled email event: ${emailEvent}`,
        level: 'ERROR'
      });
  }

  return formatPersonalizations(result);
};

export default prepareEmailPersonalizations;
