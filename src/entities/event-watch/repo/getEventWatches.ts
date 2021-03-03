import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import EventWatch from '../EventWatch';

@ArgsType()
export class GetEventWatchesArgs {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

const getEventWatches = async ({
  eventId,
  memberId
}: GetEventWatchesArgs): Promise<EventWatch[]> => {
  const args: FilterQuery<EventWatch> = eventId
    ? { event: { id: eventId } }
    : { member: { id: memberId } };

  const cacheKey = eventId
    ? `${QueryEvent.GET_EVENT_WATCHES}-${eventId}`
    : `${QueryEvent.GET_EVENT_WATCHES}-${memberId}`;

  // @ts-ignore b/c we want to query by just the member ID.
  return new BloomManager().find(EventWatch, args, {
    cacheKey,
    populate: ['event', 'member.user']
  });
};

export default getEventWatches;
