import { EmailEvent } from '@util/events';
import { CreateEventCoordinatorContext } from './prepareCreateEventCoordinatorEmail';
import { LoginLinkContext } from './prepareLoginLinkEmail';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export interface EmailsArgs {
  emailContext: CreateEventCoordinatorContext | LoginLinkContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailsArgs;
