import { MailchimpEventArgs } from '@integrations/mailchimp/processMailchimpEvent';
import { BusEvent, MailchimpEvent } from '@util/constants.events';
import eventBus from '../eventBus';

/**
 * Emits an MAILCHIMP_EVENT with the given event and payload.
 *
 * @param mailchimpEvent
 * @param args
 */
const emitMailchimpEvent = (
  mailchimpEvent: MailchimpEvent,
  args: Omit<MailchimpEventArgs, 'mailchimpEvent'>
) => {
  eventBus.emit(BusEvent.MAILCHIMP_EVENT, { ...args, mailchimpEvent });
};

export default emitMailchimpEvent;
