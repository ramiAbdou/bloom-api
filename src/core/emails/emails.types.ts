import { EmailEvent } from '@util/events';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export interface SendEmailsArgs {
  context?: any;
  event: EmailEvent;
}
