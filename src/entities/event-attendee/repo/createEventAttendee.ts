import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import Supporter from '@entities/supporter/Supporter';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class CreateEventAttendeeArgs {
  @Field({ nullable: true })
  email?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}

/**
 * Returns a new EventAttendee.
 *
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventAttendee = async (
  args: CreateEventAttendeeArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<EventAttendee> => {
  const { email, eventId, firstName, lastName } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [member, supporter]: [Member, Supporter] = await Promise.all([
    bm.findOne(Member, memberId),
    bm.findOne(Supporter, { community: communityId, email })
  ]);

  const existingAttendee = await bm.findOne(
    EventAttendee,
    member ? { member } : { member: null, supporter },
    { populate: ['member', 'supporter'] }
  );

  if (existingAttendee) return existingAttendee;

  const attendeeArgs: EntityData<EventAttendee> = member
    ? { member }
    : {
        supporter:
          supporter ?? bm.create(Supporter, { email, firstName, lastName })
      };

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { ...attendeeArgs, event: eventId },
    {
      flushEvent: MutationEvent.CREATE_EVENT_ATTENDEE,
      populate: ['member', 'supporter']
    }
  );

  return attendee;
};

export default createEventAttendee;
