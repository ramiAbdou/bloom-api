import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitGoogleEvent } from '@system/eventBus';
import { GoogleEvent, MutationEvent } from '@util/events';
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
 * @param args.eventId - ID of the Event.
 * @param args - Event data (eg: description, endTime, startTime).
 */
const updateEvent = async (args: UpdateEventArgs): Promise<Event> => {
  const { eventId, ...eventData } = args;

  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    eventId,
    { ...eventData },
    { flushEvent: MutationEvent.UPDATE_EVENT }
  );

  emitGoogleEvent(GoogleEvent.UPDATE_CALENDAR_EVENT, { eventId });

  return event;
};

export default updateEvent;
