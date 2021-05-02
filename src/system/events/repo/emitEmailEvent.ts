import { EmailArgs } from '@system/emails/emails.types';
import { BusEvent } from '@util/constants.events';
import eventBus, { EmitEventOptions } from '../eventBus';

/**
 * Emits an EMAIL_EVENT with the given event and payload.
 *
 * @param args.event - EmailEvent to emit.
 * @param args.payload - Payload to be sent in the email.
 * @param options
 */
const emitEmailEvent = (
  emailArgs: EmailArgs,
  options?: EmitEventOptions
): void => {
  setTimeout(() => {
    eventBus.emit(BusEvent.EMAIL_EVENT, emailArgs);
  }, options?.delay ?? 0);
};

export default emitEmailEvent;
