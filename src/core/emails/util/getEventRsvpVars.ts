import BloomManager from '@core/db/BloomManager';
import { Event, EventGuest, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface GetEventRsvpContext {
  guestId: string;
}

export interface GetEventRsvpVars {
  event: Pick<Event, 'eventUrl' | 'title'>;
  user: Pick<User, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailContext
): Promise<GetEventRsvpVars[]> => {
  const { guestId } = context as GetEventRsvpContext;

  const bm = new BloomManager();

  const [event, guest]: [Event, EventGuest] = await Promise.all([
    bm.findOne(Event, { guests: { id: guestId } }, { fields: ['title'] }),
    bm.findOne(EventGuest, { id: guestId }, { fields: ['email', 'firstName'] })
  ]);

  if (!guest) throw new Error('Event guest no longer exists.');

  const variables: GetEventRsvpVars[] = [
    {
      event: { ...event, eventUrl: await event.eventUrl },
      user: { email: guest.email, firstName: guest.firstName }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
