import { find, findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { stringifyEmailTimestamp } from '../emails.util';

export interface DeleteEventGuestsPayload {
  communityId: string;
  eventId: string;
}

export interface DeleteEventGuestsVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'startTime' | 'title'>;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getDeleteEventGuestsVars = async ({
  communityId,
  eventId
}: DeleteEventGuestsPayload): Promise<DeleteEventGuestsVars[]> => {
  const [community, event, guests]: [
    Community,
    Event,
    EventGuest[]
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Event, { id: eventId }, { filters: false }),
    find(EventGuest, { event: eventId }, { populate: ['member', 'supporter'] })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialEvent: Pick<Event, 'startTime' | 'title'> = {
    startTime: stringifyEmailTimestamp(event.startTime),
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
