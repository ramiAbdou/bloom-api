import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventWatch from '../EventWatch';

@ArgsType()
export class CreateEventWatchArgs {
  @Field()
  eventId: string;
}

const createEventWatch = async (
  { eventId }: CreateEventWatchArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
) => {
  return new BloomManager().createAndFlush(
    EventWatch,
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_EVENT}-${eventId}`],
      event: 'CREATE_EVENT_WATCH',
      populate: ['member.data', 'member.user']
    }
  );
};

export default createEventWatch;
