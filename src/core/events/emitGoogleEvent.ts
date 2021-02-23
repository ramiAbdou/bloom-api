import { GoogleEventArgs } from '@integrations/google/processGoogleEvent';
import { BusEvent } from '@util/events';
import eventBus from './eventBus';

const emitGoogleEvent = (args: GoogleEventArgs) => {
  eventBus.emit(BusEvent.GOOGLE_EVENT, args);
};

export default emitGoogleEvent;
