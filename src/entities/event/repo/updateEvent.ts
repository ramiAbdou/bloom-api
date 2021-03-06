import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import { GoogleEvent } from '@util/constants.events';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field()
  eventId: string;

  // Not a GraphQL Field, b/c we only call this internally.
  googleCalendarEventId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  privacy?: EventPrivacy;

  @Field({ nullable: true })
  recordingUrl?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  videoUrl?: string;
}

/**
 * Returns the updated Event.
 *
 * Precondition: Should only be called for an upcoming Event.
 *
 * @param args.description - Description of the Event to update.
 * @param args.eventId - ID of the Event to update.
 * @param args.googleCalendarEventId - ID of the Google Calendar event.
 * @param args.imageUrl - Image URL of the Event to update.
 * @param args.privacy - Privacy of the Event to update.
 * @param args.recordingUrl - Recording URL of the Event.
 * @param args.summary - Summary of the Event to update.
 * @param args.title - Title of the Event to update.
 * @param args.videoUrl - Video URL of the Event to update.
 */
const updateEvent = async (args: UpdateEventArgs): Promise<Event> => {
  const { eventId, ...eventData } = args;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    eventId,
    { ...eventData }
  );

  emitGoogleEvent(GoogleEvent.UPDATE_CALENDAR_EVENT, { eventId });

  return event;
};

export default updateEvent;
