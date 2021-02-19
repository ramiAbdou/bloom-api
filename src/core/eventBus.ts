import { EventEmitter } from 'events';

import { EmailEvent } from '@util/events';
import { CreateEventCoordinatorContext } from './emails/emails.types';
import sendEmails from './emails/sendEmails';

const eventBus = new EventEmitter();

eventBus.on(
  EmailEvent.CREATE_EVENT_COORDINATOR,
  async (context: CreateEventCoordinatorContext) => {
    await sendEmails({ context, event: EmailEvent.CREATE_EVENT_COORDINATOR });
  }
);

export default eventBus;
