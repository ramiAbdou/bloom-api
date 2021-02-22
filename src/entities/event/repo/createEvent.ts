import { calendar_v3 } from 'googleapis';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import eventBus from '@core/eventBus';
import createGoogleCalendarEvent from '@integrations/google/repo/createGoogleCalendarEvent';
import { EmailEvent, FlushEvent, MiscEvent, QueryEvent } from '@util/events';
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
  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: communityId },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      flushEvent: FlushEvent.CREATE_EVENT,
      populate: ['community']
    }
  );

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

  eventBus.emit(MiscEvent.SEND_EMAIL, {
    emailContext: { communityId, coordinatorId: memberId, eventId: event.id },
    emailEvent: EmailEvent.CREATE_EVENT_COORDINATOR
  });

  return event;
};

export default createEvent;
