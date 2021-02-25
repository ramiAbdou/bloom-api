import BloomManager from '@core/db/BloomManager';
import { Event, EventGuest, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface EventRsvpContext {
  eventId: string;
  guestId: string;
}

export interface EventRsvpVars {
  event: Pick<Event, 'title'>;
  guest: Pick<EventGuest, 'joinUrl'>;
  user: Pick<User, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailContext
): Promise<EventRsvpVars[]> => {
  const { eventId, guestId } = context as EventRsvpContext;

  const bm = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.findOne(Event, { id: eventId }),
    bm.findOne(EventGuest, { id: guestId })
  ]);

  if (!guest) throw new Error('Event guest no longer exists.');

  const variables: EventRsvpVars[] = [
    {
      event: { title: event.title },
      guest: { joinUrl: await guest.joinUrl },
      user: { email: guest.email, firstName: guest.firstName }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
