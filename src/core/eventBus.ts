import { EventEmitter } from 'events';

import { MiscEvent } from '@util/events';
import { SendEmailsArgs } from './emails/emails.types';
import sendEmails from './emails/sendEmails';

const eventBus = new EventEmitter();

eventBus.on(MiscEvent.SEND_EMAIL, async (args: SendEmailsArgs) => {
  await sendEmails(args);
});

export default eventBus;
