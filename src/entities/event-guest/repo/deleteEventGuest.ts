import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import deleteGoogleCalendarEventAttendee from '../../../integrations/google/repo/deleteGoogleCalendarEventAttendee';
import Event from '../../event/Event';
import User from '../../user/User';
import EventGuest from '../EventGuest';

@ArgsType()
export class DeleteEventGuestArgs {
  @Field()
  eventId: string;
}

/**
 * Hard deletes the EventGuest. Returns true if successful, throws error
 * otherwise.
 *
 * @param args.eventId - ID of the event.
 * @param ctx.communityId - ID of the community.
 * @param ctx.memberId - ID of the member.
 * @param ctx.userId - ID of the user.
 */
const deleteEventGuest = async (
  { eventId }: DeleteEventGuestArgs,
  {
    communityId,
    memberId,
    userId
  }: Pick<GQLContext, 'communityId' | 'memberId' | 'userId'>
): Promise<EventGuest> => {
  const guest: EventGuest = await new BloomManager().findOneAndDelete(
    EventGuest,
    { event: { id: eventId }, member: { id: memberId } },
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_EVENT_GUESTS}-${eventId}`,
        `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`
      ],
      event: 'DELETE_EVENT_GUEST'
    }
  );

  // If the event is updating only b/c of the googleCalendarEventId, don't
  // update the Google Calendar event. Otherwise, update the Google Calendar
  // event.
  setTimeout(async () => {
    const bm = new BloomManager();

    const [event, user] = await Promise.all([
      bm.findOne(Event, { id: eventId }),
      bm.findOne(User, { id: userId })
    ]);

    if (!event.googleCalendarEventId) return;

    await deleteGoogleCalendarEventAttendee(event.googleCalendarEventId, {
      email: user.email
    });
  }, 0);

  return guest;
};

export default deleteEventGuest;
