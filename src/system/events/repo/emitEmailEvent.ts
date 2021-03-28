import { EmailPayload } from '@system/emails/emails.types';
import { BusEvent, EmailEvent } from '@util/constants.events';
import eventBus, { EmitEventOptions } from '../eventBus';

/**
 * Emits an EMAIL_EVENT with the given event and payload.
 *
 * @param emailEvent
 * @param emailPayload
 * @param options
 */
const emitEmailEvent = (
  emailEvent: EmailEvent,
  emailPayload: EmailPayload,
  options?: EmitEventOptions
): void => {
  setTimeout(() => {
    eventBus.emit(BusEvent.EMAIL_EVENT, { emailEvent, emailPayload });
  }, options?.delay ?? 0);
};

export default emitEmailEvent;
