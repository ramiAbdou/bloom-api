import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { take } from '@util/util';
import EventAttendee from '../EventAttendee';

@ArgsType()
export class ListEventAttendeesArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventAttendee(s).
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listEventAttendees = async (
  args: ListEventAttendeesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventAttendee[]> => {
  const { eventId, memberId } = args;
  const { communityId } = ctx;

  const queryArgs = take([
    [eventId, { event: eventId }],
    [memberId, { member: memberId }],
    [communityId, { event: { community: communityId } }]
  ]);

  const attendees: EventAttendee[] = await new BloomManager().find(
    EventAttendee,
    queryArgs,
    {
      cacheKey: take([
        [eventId, `${QueryEvent.LIST_EVENT_ATTENDEES}-${eventId}`],
        [memberId, `${QueryEvent.LIST_EVENT_ATTENDEES}-${memberId}`],
        [communityId, `${QueryEvent.LIST_EVENT_ATTENDEES}-${communityId}`]
      ]),
      filters: false,
      populate: ['event', 'member', 'supporter']
    }
  );

  return attendees;
};

export default listEventAttendees;
