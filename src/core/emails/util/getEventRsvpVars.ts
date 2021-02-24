import BloomManager from '@core/db/BloomManager';
import { Event, EventGuest, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface GetEventRsvpContext {
  eventId: string;
  guestId: string;
}

export interface GetEventRsvpVars {
  event: Pick<Event, 'title'>;
  guest: Pick<EventGuest, 'joinUrl'>;
  user: Pick<User, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailContext
): Promise<GetEventRsvpVars[]> => {
  const { eventId, guestId } = context as GetEventRsvpContext;

  const bm = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.findOne(Event, { id: eventId }),
    bm.findOne(EventGuest, { id: guestId })
  ]);

  if (!guest) throw new Error('Event guest no longer exists.');

  const variables: GetEventRsvpVars[] = [
    {
      event: { title: event.title },
      guest: { joinUrl: await guest.joinUrl },
      user: { email: guest.email, firstName: guest.firstName }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
