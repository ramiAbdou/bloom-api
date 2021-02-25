import BloomManager from '@core/db/BloomManager';
import { Community, Event, EventGuest, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface DeleteEventGuestsContext {
  communityId: string;
  eventId: string;
}

export interface DeleteEventGuestsVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'startTime' | 'title'>;
  user: Pick<User, 'email' | 'firstName'>;
}

const getDeleteEventGuestsVars = async (
  context: EmailContext
): Promise<DeleteEventGuestsVars[]> => {
  const { communityId, eventId } = context as DeleteEventGuestsContext;

  const bm = new BloomManager();

  const [community, event, guests]: [
    Community,
    Event,
    EventGuest[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }, { filters: false }),
    bm.find(EventGuest, { event: eventId })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialEvent: Pick<Event, 'startTime' | 'title'> = {
    startTime: event.startTime,
    title: event.title
  };

  const variables: DeleteEventGuestsVars[] = guests.map((guest: EventGuest) => {
    return {
      community: partialCommunity,
      event: partialEvent,
      user: { email: guest.email, firstName: guest.firstName }
    };
  });

  return variables;
};

export default getDeleteEventGuestsVars;
