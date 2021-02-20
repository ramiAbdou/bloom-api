import User from '@entities/user/User';
import { EmailEvent } from '@util/events';
import Event from '../../entities/event/Event';
import Member from '../../entities/member/Member';
import BloomManager from '../db/BloomManager';
import {
  CreateEventCoordinatorContext,
  CreateEventCoordinatorVars,
  LoginLinkContext,
  LoginLinkVars,
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

const prepareCreateEventCoordinatorPersonalizations = async (
  args: Omit<SendEmailsArgs, 'event'>
) => {
  const context = args.context as CreateEventCoordinatorContext;

  const bm = new BloomManager();

  const [coordinator, event]: [Member, Event] = await Promise.all([
    bm.findOne(Member, { id: context?.coordinatorId }, { populate: ['user'] }),
    bm.findOne(Event, { id: context?.eventId })
  ]);

  const variables: CreateEventCoordinatorVars[] = [
    { event, user: coordinator.user }
  ];

  return formatPersonalizations(variables);
};

const prepareLoginLinkPersonalizations = async (
  args: Omit<SendEmailsArgs, 'event'>
) => {
  const { email, loginUrl } = args.context as LoginLinkContext;

  const user: User = await new BloomManager().findOne(User, { email });
  const variables: LoginLinkVars[] = [{ loginUrl, user }];

  return formatPersonalizations(variables);
};

const prepareEmailPersonalizations = async ({
  event: emailEvent,
  ...args
}: SendEmailsArgs) => {
  if (emailEvent === EmailEvent.CREATE_EVENT_COORDINATOR) {
    return prepareCreateEventCoordinatorPersonalizations(args);
  }

  if (emailEvent === EmailEvent.LOGIN_LINK) {
    return prepareLoginLinkPersonalizations(args);
  }

  return [];
};

export default prepareEmailPersonalizations;
