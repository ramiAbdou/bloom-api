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

const createEventGuest = async (
  args: CreateEventGuestArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const bm = new BloomManager();

  const [member, supporter]: [Member, Supporter] = await Promise.all([
    bm.findOne(Member, ctx.memberId),
    bm.findOne(Supporter, { community: ctx.communityId, email: args.email })
  ]);

  const existingGuest = await bm.findOne(
    EventGuest,
    { $or: [{ member }, { supporter }] },
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
          supporter ??
          bm.create(Supporter, {
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName
          })
      };

  const guest: EventGuest = await bm.createAndFlush(EventGuest, guestArgs, {
    flushEvent: FlushEvent.CREATE_EVENT_GUEST,
    populate: ['member', 'supporter']
  });

  emitEmailEvent(
    EmailEvent.EVENT_RSVP,
    { communityId: ctx.communityId, eventId: args.eventId, guestId: guest.id },
    { delay: 5000 }
  );

  emitGoogleEvent(GoogleEvent.ADD_CALENDAR_EVENT_ATTENDEE, {
    eventId: args.eventId,
    guestId: guest.id
  });

  return guest;
};

export default createEventGuest;
