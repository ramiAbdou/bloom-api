import { BusEvent, EmailEvent } from '@util/events';
import { EmailContext } from '../emails/emails.types';
import eventBus from './eventBus';

interface EmitEmailEventOptions {
  delay?: number; // In ms.
}

const emitEmailEvent = (
  emailEvent: EmailEvent,
  emailContext: EmailContext,
  options?: EmitEmailEventOptions
) => {
  setTimeout(() => {
    eventBus.emit(BusEvent.EMAIL_EVENT, { emailContext, emailEvent });
  }, options?.delay ?? 0);
};

export default emitEmailEvent;
