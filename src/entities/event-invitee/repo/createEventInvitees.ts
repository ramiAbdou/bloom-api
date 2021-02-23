import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@core/events/emitEmailEvent';
import { EmailEvent, FlushEvent } from '@util/events';
import EventInvitee from '../EventInvitee';

export interface CreateEventInviteesArgs {
  eventId: string;
  memberIds: string[];
}

const createEventInvitees = async (
  { eventId, memberIds }: CreateEventInviteesArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const bm = new BloomManager();

  const invitees: EventInvitee[] = memberIds.map((memberId: string) => {
    return bm.create(EventInvitee, { event: eventId, member: memberId });
  });

  await bm.flush({ flushEvent: FlushEvent.CREATE_EVENT_INVITEES });

  emitEmailEvent(EmailEvent.CREATE_EVENT_INVITEES, {
    emailContext: { communityId, eventId, memberIds }
  });

  return invitees;
};

export default createEventInvitees;
