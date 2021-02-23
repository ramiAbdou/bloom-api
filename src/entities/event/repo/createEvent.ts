import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@core/events/emitEmailEvent';
import emitGoogleEvent from '@core/events/emitGoogleEvent';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class CreateEventArgs {
  @Field()
  description: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => String, { defaultValue: EventPrivacy.MEMBERS_ONLY })
  privacy: EventPrivacy;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  title: string;

  @Field()
  videoUrl: string;
}

const createEvent = async (
  args: CreateEventArgs,
  { communityId, memberId }: GQLContext
): Promise<Event> => {
  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: communityId },
    { flushEvent: FlushEvent.CREATE_EVENT, populate: ['community'] }
  );

  emitGoogleEvent({
    eventId: event.id,
    googleEvent: GoogleEvent.CREATE_GOOGLE_CALENDAR_EVENT
  });

  emitEmailEvent({
    emailContext: { communityId, coordinatorId: memberId, eventId: event.id },
    emailEvent: EmailEvent.CREATE_EVENT_COORDINATOR
  });

  // await updateGoogleCalendarEventId({
  //   eventId: event.id,
  //   googleCalendarEventId: googleCalendarEvent.id
  // });

  return event;
};

export default createEvent;
