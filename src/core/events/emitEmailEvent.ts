import { BusEvent } from '@util/events';
import { EmailArgs } from '../emails/emails.types';
import eventBus from './eventBus';

const emitEmailEvent = (args: EmailArgs) => {
  eventBus.emit(BusEvent.EMAIL_EVENT, args);
};

export default emitEmailEvent;
