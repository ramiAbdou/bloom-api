import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent, GoogleEvent } from '@util/constants.events';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestWithMemberArgs {
  @Field()
  eventId: string;
}

/**
 * Returns a new Eventguest.
 *
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventGuestWithMember = async (
  args: CreateEventGuestWithMemberArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<EventGuest> => {
  const { eventId } = args;
  const { communityId, memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const member: Member = await bm.findOne(Member, { id: memberId });

  const existingGuest = await bm.findOne(
    EventGuest,
    { event: eventId, member, supporter: null },
    { populate: ['member'] }
  );

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guest: EventGuest = await bm.createAndFlush(
    EventGuest,
    { event: eventId, member },
    { populate: ['member'] }
  );

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { communityId, eventId, guestId: guest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId,
    guestId: guest.id
  });

  return guest;
};

export default createEventGuestWithMember;
