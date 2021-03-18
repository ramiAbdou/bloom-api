import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitGoogleEvent } from '@system/eventBus';
import { FlushEvent, GoogleEvent } from '@util/constants.events';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => String, { defaultValue: EventPrivacy.MEMBERS_ONLY })
  privacy?: EventPrivacy;

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
 * @param args.imageUrl - Image URL of the Event to update.
 * @param args.privacy - Privacy of the Event to update.
 * @param args.summary - Summary of the Event to update.
 * @param args.title - Title of the Event to update.
 * @param args.videoUrl - Video URL of the Event to update.
 */
const updateEvent = async (args: UpdateEventArgs): Promise<Event> => {
  const { eventId, ...eventData } = args;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    eventId,
    { ...eventData },
    { flushEvent: FlushEvent.UPDATE_EVENT }
  );

  emitGoogleEvent(GoogleEvent.UPDATE_CALENDAR_EVENT, { eventId });

  return event;
};

export default updateEvent;
