import { EmailEvent } from '@util/events';
import { CreateEventCoordinatorContext } from './util/prepareCreateEventCoordinatorEmail';
import { LoginLinkContext } from './util/prepareLoginLinkEmail';
import { PaymentReceiptContext } from './util/preparePaymentReceiptEmail';

export interface FormatPersonalizationData {
  dynamicTemplateData?: Record<string, any>;
  to: { email: string };
}

export interface EmailsArgs {
  emailContext:
    | CreateEventCoordinatorContext
    | LoginLinkContext
    | PaymentReceiptContext;
  emailEvent: EmailEvent;
}

export type SendEmailsArgs = EmailsArgs;
