import { EmailEvent } from '@util/events';
import Event from '../../entities/event/Event';
import Member from '../../entities/member/Member';
import BloomManager from '../db/BloomManager';
import {
  CreateEventCoordinatorVars,
  SendEmailsArgs,
  SendEmailsVars
} from './emails.types';

interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

/**
 * Returns the formatted personalizations for a SendGrid email.
 *
 * @param variables Variables for an email template.
 */
export const formatPersonalizations = (
  variables: SendEmailsVars[]
): FormatPersonalizationData[] => {
  return variables.map((args: SendEmailsVars) => {
    return { dynamicTemplateData: args, to: { email: args.user.email } };
  });
};

const prepareEmailVariables = async ({
  context,
  event: emailEvent
}: Pick<SendEmailsArgs, 'context' | 'event'>) => {
  const bm = new BloomManager();

  if (emailEvent === EmailEvent.CREATE_EVENT_COORDINATOR) {
    const [coordinator, event]: [Member, Event] = await Promise.all([
      bm.findOne(
        Member,
        { id: context?.coordinatorId },
        { populate: ['user'] }
      ),
      bm.findOne(Event, { id: context?.eventId })
    ]);

    const variables: CreateEventCoordinatorVars[] = [
      { event, user: coordinator.user }
    ];

    return formatPersonalizations(variables);
  }

  return [];
};

export default prepareEmailVariables;
