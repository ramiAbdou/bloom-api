import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import Supporter from '@entities/supporter/Supporter';
import { emitEmailEvent, emitGoogleEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
import EventGuest from '../EventGuest';

@ArgsType()
export class CreateEventGuestArgs {
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
 * Returns a new Eventguest.
 *
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.eventId - ID of the Event.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEventGuest = async (
  args: CreateEventGuestArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const { email, eventId, firstName, lastName } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [member, supporter]: [Member, Supporter] = await Promise.all([
    bm.findOne(Member, memberId),
    bm.findOne(Supporter, { community: communityId, email })
  ]);

  const existingGuest = await bm.findOne(
    EventGuest,
    member ? { member } : { member: null, supporter },
    { populate: ['member', 'supporter'] }
  );

  if (existingGuest) {
    throw new Error(
      'An RSVP for this event with this email has already been registered.'
    );
  }

  const guestArgs: EntityData<EventGuest> = member
    ? { member }
    : {
        supporter:
          supporter ?? bm.create(Supporter, { email, firstName, lastName })
      };

  const guest: EventGuest = await bm.createAndFlush(
    EventGuest,
    { event: eventId, ...guestArgs },
    {
      flushEvent: FlushEvent.CREATE_EVENT_GUEST,
      populate: ['member', 'supporter']
    }
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

export default createEventGuest;
