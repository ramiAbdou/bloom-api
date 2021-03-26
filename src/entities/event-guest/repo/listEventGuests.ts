import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import { take } from '@util/util';
import EventGuest from '../EventGuest';

@ArgsType()
export class ListEventGuestsArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventGuest(s).
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listEventGuests = async (
  args: ListEventGuestsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventGuest[]> => {
  const { eventId, memberId } = args;
  const { communityId } = ctx;

  const queryArgs: FilterQuery<EventGuest> = take([
    [eventId, { event: eventId }],
    [memberId, { member: memberId }],
    [communityId, { event: { community: communityId } }]
  ]);

  const guests: EventGuest[] = await new BloomManager().find(
    EventGuest,
    queryArgs,
    {
      cacheKey: take([
        [eventId, `${QueryEvent.LIST_EVENT_GUESTS}-${eventId}`],
        [memberId, `${QueryEvent.LIST_EVENT_GUESTS}-${memberId}`],
        [communityId, `${QueryEvent.LIST_EVENT_GUESTS}-${communityId}`]
      ]),
      filters: false,
      populate: ['event', 'member', 'supporter']
    }
  );

  return guests;
};

export default listEventGuests;
