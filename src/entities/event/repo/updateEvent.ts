import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import updateGoogleCalendarEvent from '@integrations/google/repo/updateGoogleCalendarEvent';
import { FlushEvent } from '@util/events';
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

  await updateGoogleCalendarEvent(event.googleCalendarEventId, {
    description: event.description,
    summary: event.title,
    visibility:
      event.privacy === EventPrivacy.MEMBERS_ONLY ? 'private' : 'public'
  });

  return event;
};

export default updateEvent;
