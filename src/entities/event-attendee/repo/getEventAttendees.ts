import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class GetEventAttendeesArgs {
  @Field()
  eventId: string;
}

const getEventAttendees = async ({ eventId }: GetEventAttendeesArgs) => {
  return new BloomManager().find(
    EventAttendee,
    { event: { id: eventId } },
    {
      cacheKey: `${QueryEvent.GET_EVENT_ATTENDEES}-${eventId}`,
      populate: ['event', 'member.user']
    }
  );
};

export default getEventAttendees;
