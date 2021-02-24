import { BusEvent, EmailEvent } from '@util/events';
import { EmailContext } from '../emails/emails.types';
import eventBus, { EmitEventOptions } from './eventBus';

const emitEmailEvent = (
  emailEvent: EmailEvent,
  emailContext: EmailContext,
  options?: EmitEventOptions
) => {
  setTimeout(() => {
    eventBus.emit(BusEvent.EMAIL_EVENT, { emailContext, emailEvent });
  }, options?.delay ?? 0);
};

export default emitEmailEvent;
