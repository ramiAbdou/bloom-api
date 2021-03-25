import { GoogleEventArgs } from '@integrations/google/processGoogleEvent';
import { BusEvent, GoogleEvent } from '@util/constants.events';
import eventBus, { EmitEventOptions } from '../eventBus';

/**
 * Emits an GOOGLE_EVENT with the given event and payload.
 *
 * @param googleEvent
 * @param args
 * @param options
 */
const emitGoogleEvent = (
  googleEvent: GoogleEvent,
  args: Omit<GoogleEventArgs, 'googleEvent'>,
  options?: EmitEventOptions
) => {
  setTimeout(() => {
    eventBus.emit(BusEvent.GOOGLE_EVENT, { ...args, googleEvent });
  }, options?.delay ?? 0);
};

export default emitGoogleEvent;
