import { BusEvent, EmailEvent } from '@util/events';
import { EmailArgs } from '../emails/emails.types';
import eventBus from './eventBus';

const emitEmailEvent = (
  emailEvent: EmailEvent,
  args: Omit<EmailArgs, 'emailEvent'>
) => {
  eventBus.emit(BusEvent.EMAIL_EVENT, { ...args, emailEvent });
};

export default emitEmailEvent;
