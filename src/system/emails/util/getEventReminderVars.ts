import jwt from 'jsonwebtoken';

import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { VerifiedToken } from '@entities/user/repo/verifyToken';
import { APP, JWT } from '@util/constants';
import { VerifyEvent } from '@util/events';
import URLBuilder from '@util/URLBuilder';
import { EmailPayload } from '../emails.types';

export interface EventReminderPayload {
  eventId: string;
}

export interface EventReminderVars {
  event: Pick<Event, 'startTime' | 'title'>;
  joinUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getEventReminderVars = async (
  context: EmailPayload
): Promise<EventReminderVars[]> => {
  const { eventId } = context as EventReminderPayload;

  const event: Event = await new BloomManager().findOne(Event, eventId, {
    populate: ['community', 'guests']
  });

  const guests: EventGuest[] = event.guests.getItems();

  const variables: EventReminderVars[] = guests.map((guest: EventGuest) => {
    const token: string = jwt.sign(
      {
        event: VerifyEvent.JOIN_EVENT,
        guestId: guest.id,
        memberId: guest.member.id
      } as VerifiedToken,
      JWT.SECRET
    );

    const joinUrl: string = new URLBuilder(
      `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`
    ).addParam('token', token).url;

    return {
      event: { startTime: event.startTime, title: event.title },
      joinUrl,
      member: { email: guest.email, firstName: guest.firstName }
    };
  });

  return variables;
};

export default getEventReminderVars;
