import { ArgsType, Field } from 'type-graphql';

import { GQLContext, LoggerEvent, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import Event from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  googleCalendarEventId?: string;

  @Field()
  id: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  private?: boolean;

  @Field({ nullable: true })
  recordingUrl?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  videoUrl?: string;
}

const updateEvent = async (
  { id: eventId, ...args }: UpdateEventArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
): Promise<Event> => {
  let loggerEvent: LoggerEvent;

  if (args?.recordingUrl) loggerEvent = 'UPDATE_EVENT_RECORDING_LINK';
  else if (args?.googleCalendarEventId) {
    loggerEvent = 'ATTACH_GOOGLE_CALENDAR_EVENT';
  } else loggerEvent = 'UPDATE_EVENT';

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { ...args },
    {
      cacheKeysToInvalidate: [
        ...(args?.recordingUrl
          ? [`${QueryEvent.GET_PAST_EVENTS}-${communityId}`]
          : [`${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`])
      ],
      event: loggerEvent
    }
  );

  // If the event is updating only b/c of the googleCalendarEventId, don't
  // update the Google Calendar event. Otherwise, update the Google Calendar
  // event.
  setTimeout(async () => {
    if (args?.googleCalendarEventId || !event.googleCalendarEventId) return;

    await updateGoogleCalendarEvent(event.googleCalendarEventId, {
      description: event.description,
      summary: event.title,
      visibility: event.private ? 'private' : 'public'
    });
  }, 0);

  return event;
};

export default updateEvent;
