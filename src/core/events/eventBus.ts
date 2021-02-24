import { EventEmitter } from 'events';

import processGoogleEvent, {
  GoogleEventArgs
} from '@integrations/google/processGoogleEvent';
import processMailchimpEvent, {
  MailchimpEventArgs
} from '@integrations/mailchimp/processMailchimpEvent';
import { BusEvent } from '@util/events';
import { EmailArgs } from '../emails/emails.types';
import sendEmails from '../emails/sendEmails';

export interface EmitEventOptions {
  delay?: number; // In ms.
}

const eventBus = new EventEmitter();

eventBus.on(BusEvent.EMAIL_EVENT, async (args: EmailArgs) => {
  await sendEmails(args);
});

eventBus.on(BusEvent.GOOGLE_EVENT, async (args: GoogleEventArgs) => {
  await processGoogleEvent(args);
});

eventBus.on(BusEvent.MAILCHIMP_EVENT, async (args: MailchimpEventArgs) => {
  await processMailchimpEvent(args);
});

export default eventBus;
