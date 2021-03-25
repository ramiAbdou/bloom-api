import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

export interface DeleteEventGuestsPayload {
  communityId: string;
  eventId: string;
}

export interface DeleteEventGuestsVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'startTime' | 'title'>;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getDeleteEventGuestsVars = async (
  context: EmailPayload
): Promise<DeleteEventGuestsVars[]> => {
  const { communityId, eventId } = context as DeleteEventGuestsPayload;

  const bm: BloomManager = new BloomManager();

  const [community, event, guests]: [
    Community,
    Event,
    EventGuest[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }, { filters: false }),
    bm.find(
      EventGuest,
      { event: eventId },
      { populate: ['member', 'supporter'] }
    )
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
      member: {
        email: guest.member?.email ?? guest.supporter?.email,
        firstName: guest.member?.firstName ?? guest.supporter?.firstName
      }
    };
  });

  return variables;
};

export default getDeleteEventGuestsVars;
