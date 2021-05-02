import BloomManager from '@core/db/BloomManager';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';
import { EmailPayload } from '../emails.types';

export interface EventRsvpPayload {
  eventId: string;
  guestId: string;
}

export interface EventRsvpVars {
  event: Pick<Event, 'title'>;
  joinUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailPayload
): Promise<EventRsvpVars[]> => {
  const { eventId, guestId } = context as EventRsvpPayload;

  const bm: BloomManager = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.em.findOne(Event, { id: eventId }, { populate: ['community'] }),
    bm.em.findOne(
      EventGuest,
      { id: guestId },
      { populate: ['member', 'supporter'] }
    )
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
