import { EventEmitter } from 'events';

import processGoogleEvent, {
  GoogleEventArgs
} from '@integrations/google/processGoogleEvent';
import processMailchimpEvent, {
  MailchimpEventArgs
} from '@integrations/mailchimp/processMailchimpEvent';
import {
  BusEvent,
  EmailEvent,
  GoogleEvent,
  MailchimpEvent
} from '@util/events';
import { EmailArgs, EmailPayload } from './emails/emails.types';
import sendEmails from './emails/sendEmails';

export interface EmitEventOptions {
  delay?: number; // In ms.
}

const eventBus = new EventEmitter();

// ## EMAIL EVENT

export const emitEmailEvent = (
  emailEvent: EmailEvent,
  emailPayload: EmailPayload,
  options?: EmitEventOptions
) => {
  setTimeout(() => {
    eventBus.emit(BusEvent.EMAIL_EVENT, { emailEvent, emailPayload });
  }, options?.delay ?? 0);
};

eventBus.on(BusEvent.EMAIL_EVENT, async (args: EmailArgs) => {
  await sendEmails(args);
});

// ## GOOGLE EVENT

export const emitGoogleEvent = (
  googleEvent: GoogleEvent,
  args: Omit<GoogleEventArgs, 'googleEvent'>
) => {
  eventBus.emit(BusEvent.GOOGLE_EVENT, { ...args, googleEvent });
};

eventBus.on(BusEvent.GOOGLE_EVENT, async (args: GoogleEventArgs) => {
  await processGoogleEvent(args);
});

// ## MAILCHIMP EVENT

export const emitMailchimpEvent = (
  mailchimpEvent: MailchimpEvent,
  args: Omit<MailchimpEventArgs, 'mailchimpEvent'>
) => {
  eventBus.emit(BusEvent.MAILCHIMP_EVENT, { ...args, mailchimpEvent });
};

eventBus.on(BusEvent.MAILCHIMP_EVENT, async (args: MailchimpEventArgs) => {
  await processMailchimpEvent(args);
});

export default eventBus;
