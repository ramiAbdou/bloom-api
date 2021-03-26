import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import { take } from '@util/util';
import EventWatch from '../EventWatch';

@ArgsType()
export class ListEventWatchesArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the EventWatch(s).
 *
 * @param args.communityId - ID of the Event.
 * @param args.eventId - ID of the Event.
 * @param args.memberId - ID of the Member.
 */
const listEventWatches = async (
  args: ListEventWatchesArgs
): Promise<EventWatch[]> => {
  const { communityId, eventId, memberId } = args;

  const queryArgs = take([
    [communityId, { event: { community: communityId } }],
    [eventId, { event: eventId }],
    [memberId, { member: memberId }]
  ]);

  const watches: EventWatch[] = await new BloomManager().find(
    EventWatch,
    queryArgs,
    {
      cacheKey: take([
        [communityId, `${QueryEvent.LIST_EVENT_WATCHES}-${communityId}`],
        [eventId, `${QueryEvent.LIST_EVENT_WATCHES}-${eventId}`],
        [memberId, `${QueryEvent.LIST_EVENT_WATCHES}-${memberId}`]
      ]),
      populate: ['event', 'member']
    }
  );

  return watches;
};

export default listEventWatches;
