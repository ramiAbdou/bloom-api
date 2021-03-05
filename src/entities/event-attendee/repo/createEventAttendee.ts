import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import Supporter from '@entities/supporter/Supporter';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
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
 * @param args.email - Email of the NON-MEMBER attendee.
 * @param args.firstName - First name of the NON-MEMBER attendee.
 * @param args.lastName - Last name of the NON-MEMBER attendee.
 * @param args.eventId - ID of the event.
 * @param ctx.memberId - ID of the member.
 */
const createEventAttendee = async (
  args: CreateEventAttendeeArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const bm = new BloomManager();

  const [member, supporter]: [Member, Supporter] = await Promise.all([
    bm.findOne(Member, ctx.memberId),
    bm.findOne(Supporter, { community: ctx.communityId, email: args.email })
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
          supporter ??
          bm.create(Supporter, {
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName
          })
      };

  const attendee = await bm.createAndFlush(
    EventAttendee,
    { event: args.eventId, ...attendeeArgs },
    {
      flushEvent: FlushEvent.CREATE_EVENT_ATTENDEE,
      populate: ['member', 'supporter']
    }
  );

  return attendee;
};

export default createEventAttendee;
