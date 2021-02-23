import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import eventBus from '@core/events/eventBus';
import { BusEvent, FlushEvent, GoogleEvent } from '@util/events';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class UpdateEventArgs {
  @Field({ nullable: true })
  description?: string;

  @Field()
  id: string;

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

const updateEvent = async ({
  id: eventId,
  ...args
}: UpdateEventArgs): Promise<Event> => {
  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { ...args },
    { flushEvent: FlushEvent.UPDATE_EVENT }
  );

  eventBus.emit(BusEvent.GOOGLE_EVENT, {
    eventId,
    googleEvent: GoogleEvent.UPDATE_GOOGLE_CALENDAR_EVENT
  });

  return event;
};

export default updateEvent;
