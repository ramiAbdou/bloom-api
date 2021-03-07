import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import { take } from '@util/util';
import EventWatch from '../EventWatch';

@ArgsType()
export class GetEventWatchesArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventWatch(s) of either the Event or Member.
 *
 * @param args.communityId - ID of the Event.
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const getEventWatches = async (
  args: GetEventWatchesArgs
): Promise<EventWatch[]> => {
  const { communityId, eventId, memberId } = args;

  const queryArgs: FilterQuery<EventWatch> = take([
    [communityId, { event: { community: communityId } }],
    [eventId, { event: eventId }],
    [memberId, { member: memberId }]
  ]);

  const watches: EventWatch[] = await new BloomManager().find(
    EventWatch,
    queryArgs,
    {
      cacheKey: take([
        [communityId, `${QueryEvent.GET_EVENT_WATCHES}-${communityId}`],
        [eventId, `${QueryEvent.GET_EVENT_WATCHES}-${eventId}`],
        [memberId, `${QueryEvent.GET_EVENT_WATCHES}-${memberId}`]
      ]),
      populate: ['event', 'member']
    }
  );

  return watches;
};

export default getEventWatches;
