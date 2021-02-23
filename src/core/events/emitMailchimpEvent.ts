import { MailchimpEventArgs } from '@integrations/mailchimp/processMailchimpEvent';
import { BusEvent } from '@util/events';
import eventBus from './eventBus';

const emitMailchimpEvent = (args: MailchimpEventArgs) => {
  eventBus.emit(BusEvent.MAILCHIMP_EVENT, args);
};

export default emitMailchimpEvent;
