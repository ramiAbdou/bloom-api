import { findOne } from '@core/db/db.util';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';

export interface EventRsvpPayload {
  eventId: string;
  guestId: string;
}

export interface EventRsvpVars {
  event: Pick<Event, 'title'>;
  joinUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getEventRsvpVars = async ({
  eventId,
  guestId
}: EventRsvpPayload): Promise<EventRsvpVars[]> => {
  const [event, guest]: [Event, EventGuest] = await Promise.all([
    findOne(Event, { id: eventId }, { populate: ['community'] }),
    findOne(EventGuest, { id: guestId }, { populate: ['member', 'supporter'] })
  ]);

  const token: string = signToken({
    expires: false,
    payload: { event: VerifyEvent.JOIN_EVENT, guestId }
  });

  const joinUrl: string = buildUrl({
    params: { token },
    url: `${APP.CLIENT_URL}/${event.community.urlName}/events/${eventId}`
  });

  const variables: EventRsvpVars[] = [
    {
      event: { title: event.title },
      joinUrl,
      member: {
        email: guest.member?.email ?? guest.supporter?.email,
        firstName: guest.member?.firstName ?? guest?.supporter?.firstName
      }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
