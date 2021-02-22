import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Event from '../Event';

export interface UpdateGoogleCalendarEventIdArgs {
  eventId: string;
  googleCalendarEventId?: string;
}

const updateGoogleCalendarEventId = async ({
  eventId,
  googleCalendarEventId
}: UpdateGoogleCalendarEventIdArgs) => {
  const event: Event = await new BloomManager().findOneAndUpdate(
    Event,
    { id: eventId },
    { googleCalendarEventId },
    { flushEvent: FlushEvent.UPDATE_GOOGLE_CALENDAR_EVENT_ID }
  );

  return event;
};

export default updateGoogleCalendarEventId;
