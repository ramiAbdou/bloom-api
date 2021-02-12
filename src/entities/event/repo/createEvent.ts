import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import createGoogleCalendarEvent from '@integrations/google/repo/createGoogleCalendarEvent';
import Event from '../Event';
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

  @Field({ defaultValue: true })
  private: boolean;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  title: string;
}

const createEvent = async (
  args: CreateEventArgs,
  { communityId }: GQLContext
): Promise<Event> => {
  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: { id: communityId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'CREATE_EVENT',
      populate: ['community']
    }
  );

  // After the event gets created, create the Google Calendar event as well.
  // Also attaches it to the newly created Event.
  setTimeout(async () => {
    const googleCalendarEvent = await createGoogleCalendarEvent({
      description: args.description,
      end: { dateTime: args.endTime },
      location: event.eventUrl,
      start: { dateTime: args.startTime },
      summary: args.title,
      visibility: args.private ? 'private' : 'public'
    });

    await updateEvent(
      { googleCalendarEventId: googleCalendarEvent.id, id: event.id },
      { communityId }
    );
  }, 0);

  return event;
};

export default createEvent;
