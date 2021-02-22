import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import eventBus from '@core/eventBus';
import createGoogleCalendarEvent from '@integrations/google/repo/createGoogleCalendarEvent';
import { EmailEvent, FlushEvent, MiscEvent } from '@util/events';
import Event, { EventPrivacy } from '../Event';
import updateEvent from './updateEvent';

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
  const eventId = nanoid();

  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: communityId, id: eventId },
    { flushEvent: FlushEvent.CREATE_EVENT, populate: ['community'] }
  );

  eventBus.emit(MiscEvent.SEND_EMAIL, {
    emailContext: { communityId, coordinatorId: memberId, eventId },
    emailEvent: EmailEvent.CREATE_EVENT_COORDINATOR
  });

  const googleCalendarEvent = await createGoogleCalendarEvent({
    description: event.description,
    end: { dateTime: event.endTime },
    location: await event.eventUrl(),
    start: { dateTime: event.startTime },
    summary: event.title,
    visibility:
      event.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
  });

  await updateEvent({
    googleCalendarEventId: googleCalendarEvent.id,
    id: event.id
  });

  return event;
};

export default createEvent;
