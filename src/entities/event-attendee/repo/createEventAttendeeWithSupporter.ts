import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Supporter from '@entities/supporter/Supporter';
import createSupporter from '../../supporter/repo/createSupporter';
import EventAttendee from '../EventAttendee';
import assertCreateEventAttendee from './assertCreateEventAttendee';

@ArgsType()
export class CreateEventAttendeeWithSupporterArgs {
  @Field({ nullable: true })
  email?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  supporterId?: string;
}

/**
 * Returns a new EventAttendee.
 *
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.eventId - ID of the Event.
 */
const createEventAttendeeWithSupporter = async (
  args: CreateEventAttendeeWithSupporterArgs
): Promise<EventAttendee> => {
  const { email, eventId, firstName, lastName, supporterId } = args;

  await assertCreateEventAttendee(args);

  const bm: BloomManager = new BloomManager();

  const event: Event = await bm.em.findOne(Event, { id: eventId });

  const supporter: Supporter = await createSupporter({
    communityId: event.community.id,
    email,
    firstName,
    lastName,
    supporterId
  });

  const existingAttendee: EventAttendee = await bm.em.findOne(
    EventAttendee,
    { event: eventId, member: null, supporter: supporter.id },
    { populate: ['supporter'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { event: eventId, supporter: supporter.id },
    { populate: ['supporter'] }
  );

  return attendee;
};

export default createEventAttendeeWithSupporter;
