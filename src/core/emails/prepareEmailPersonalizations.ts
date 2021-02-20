import { EmailEvent } from '@util/events';
import { FormatPersonalizationData, SendEmailsArgs } from './emails.types';
import prepareCreateEventCoordinatorEmail from './prepareCreateEventCoordinatorEmail';
import prepareLoginLinkEmail from './prepareLoginLinkEmail';

const prepareEmailPersonalizations = async ({
  context,
  event: emailEvent
}: SendEmailsArgs): Promise<FormatPersonalizationData[]> => {
  if (emailEvent === EmailEvent.CREATE_EVENT_COORDINATOR) {
    return prepareCreateEventCoordinatorEmail(context);
  }

  if (emailEvent === EmailEvent.LOGIN_LINK) {
    return prepareLoginLinkEmail(context);
  }

  return [];
};

export default prepareEmailPersonalizations;
