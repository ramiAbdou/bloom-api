import { find, findOne } from '@core/db/db.util';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';
import { stringifyEmailTimestamp } from '../emails.util';

export interface EventReminderPayload {
  eventId: string;
}

export interface EventReminderVars {
  event: Pick<Event, 'startTime' | 'title'>;
  joinUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getEventReminderVars = async ({
  eventId
}: EventReminderPayload): Promise<EventReminderVars[]> => {
  const [event, guests]: [Event, EventGuest[]] = await Promise.all([
    findOne(Event, { id: eventId }),
    find(EventGuest, { event: eventId })
  ]);

  const variables: EventReminderVars[] = guests.map((guest: EventGuest) => {
    const token: string = signToken({
      expires: false,
      payload: { event: VerifyEvent.JOIN_EVENT, guestId: guest.id }
    });

    const joinUrl: string = buildUrl({
      params: { token },
      url: `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`
    });

    return {
      event: {
        startTime: stringifyEmailTimestamp(event.startTime),
        title: event.title
      },
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
