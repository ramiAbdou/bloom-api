import jwt from 'jsonwebtoken';

import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { VerifiedToken } from '@entities/user/repo/verifyToken';
import { APP, JWT } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl } from '@util/util';
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
    populate: ['community', 'guests.member', 'guests.supporter']
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

    const joinUrl: string = buildUrl(
      `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`,
      { token }
    );

    return {
      event: { startTime: event.startTime, title: event.title },
      joinUrl,
      member: {
        email: guest.member?.email ?? guest.supporter?.email,
        firstName: guest.member?.firstName ?? guest.supporter?.firstName
      }
    };
  });

  return variables;
};

export default getEventReminderVars;
