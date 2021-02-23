import { EventEmitter } from 'events';

import { BusEvent } from '@util/events';
import processGoogleEvent, {
  ProcessGoogleEventArgs
} from '../../integrations/google/repo/processGoogleEvent';
import { EmailArgs } from '../emails/emails.types';
import sendEmails from '../emails/sendEmails';

const eventBus = new EventEmitter();

eventBus.on(BusEvent.GOOGLE_EVENT, async (args: ProcessGoogleEventArgs) => {
  await processGoogleEvent(args);
});

eventBus.on(BusEvent.EMAIL_EVENT, async (args: EmailArgs) => {
  await sendEmails(args);
});

export default eventBus;
