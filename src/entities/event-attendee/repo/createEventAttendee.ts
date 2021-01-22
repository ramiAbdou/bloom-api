import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class CreateEventAttendeeArgs {
  @Field()
  eventId: string;
}

const createEventAttendee = async (
  { eventId }: CreateEventAttendeeArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
) => {
  const [attendee] = await new BloomManager().findOneOrCreateAndFlush(
    EventAttendee,
    { event: { id: eventId }, member: { id: memberId } },
    { event: { id: eventId }, member: { id: memberId } },
    { event: 'CREATE_EVENT_ATTENDEE' }
  );

  return attendee;
};

export default createEventAttendee;
