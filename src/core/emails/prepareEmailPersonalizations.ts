import { EmailEvent } from '@util/events';
import { FormatPersonalizationData, SendEmailsArgs } from './emails.types';
import prepareCreateEventCoordinatorEmail, {
  CreateEventCoordinatorContext
} from './prepareCreateEventCoordinatorEmail';
import prepareLoginLinkEmail, {
  LoginLinkContext
} from './prepareLoginLinkEmail';
import preparePaymentReceiptEmail, {
  PaymentReceiptContext
} from './preparePaymentReceiptEmail';

const prepareEmailPersonalizations = async ({
  emailContext,
  emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[]> => {
  if (emailEvent === EmailEvent.CREATE_EVENT_COORDINATOR) {
    return prepareCreateEventCoordinatorEmail(
      emailContext as CreateEventCoordinatorContext
    );
  }

  if (emailEvent === EmailEvent.LOGIN_LINK) {
    return prepareLoginLinkEmail(emailContext as LoginLinkContext);
  }

  if (emailEvent === EmailEvent.PAYMENT_RECEIPT) {
    return preparePaymentReceiptEmail(emailContext as PaymentReceiptContext);
  }

  return [];
};

export default prepareEmailPersonalizations;
