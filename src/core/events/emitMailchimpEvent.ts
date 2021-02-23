import { MailchimpEventArgs } from '@integrations/mailchimp/processMailchimpEvent';
import { BusEvent, MailchimpEvent } from '@util/events';
import eventBus from './eventBus';

const emitMailchimpEvent = (
  mailchimpEvent: MailchimpEvent,
  args: Omit<MailchimpEventArgs, 'mailchimpEvent'>
) => {
  eventBus.emit(BusEvent.MAILCHIMP_EVENT, { ...args, mailchimpEvent });
};

export default emitMailchimpEvent;
