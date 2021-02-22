import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { EmailEvent, FlushEvent } from '@util/events';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class CreateEventArgs {
  @Field()
  description: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  videoUrl: string;

  @Field(() => String, { defaultValue: EventPrivacy.MEMBERS_ONLY })
  privacy: EventPrivacy;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  title: string;
}

const createEvent = async (
  args: CreateEventArgs,
  { communityId, memberId }: GQLContext
): Promise<Event> => {
  const eventId = nanoid();

  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: communityId, id: eventId },
    {
      emailContext: { communityId, coordinatorId: memberId, eventId },
      emailEvent: EmailEvent.CREATE_EVENT_COORDINATOR,
      flushEvent: FlushEvent.CREATE_EVENT,
      populate: ['community']
    }
  );

  return event;
};

export default createEvent;
