import { GoogleEventArgs } from '@integrations/google/processGoogleEvent';
import { BusEvent } from '@util/constants.events';
import eventBus, { EmitEventOptions } from '../eventBus';

/**
 * Emits an GOOGLE_EVENT with the given event and payload.
 *
 * @param googleEvent
 * @param args
 * @param options
 */
const emitGoogleEvent = (
  googleEventArgs: GoogleEventArgs,
  options?: EmitEventOptions
): void => {
  setTimeout(() => {
    eventBus.emit(BusEvent.GOOGLE_EVENT, googleEventArgs);
  }, options?.delay ?? 0);
};

export default emitGoogleEvent;
