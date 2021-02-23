import { GoogleEventArgs } from '@integrations/google/processGoogleEvent';
import { BusEvent, GoogleEvent } from '@util/events';
import eventBus from './eventBus';

const emitGoogleEvent = (
  googleEvent: GoogleEvent,
  args: Omit<GoogleEventArgs, 'googleEvent'>
) => {
  eventBus.emit(BusEvent.GOOGLE_EVENT, { ...args, googleEvent });
};

export default emitGoogleEvent;
