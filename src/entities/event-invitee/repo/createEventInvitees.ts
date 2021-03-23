import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/constants.events';
import EventInvitee from '../EventInvitee';

export interface CreateEventInviteesArgs {
  eventId: string;
  memberIds: string[];
}

/**
 * Returns the new EventInvitee(s).
 *
 * @param args.eventId - ID of the Event.
 * @param args.memberIds - IDs of the Member(s) to invite.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const createEventInvitees = async (
  args: CreateEventInviteesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventInvitee[]> => {
  const { eventId, memberIds } = args;
  const { communityId } = ctx;

  if (!memberIds.length) return [];

  const bm: BloomManager = new BloomManager();

  const invitees: EventInvitee[] = memberIds.map((memberId: string) => {
    return bm.create(EventInvitee, { event: eventId, member: memberId });
  });

  await bm.flush({ flushEvent: FlushEvent.CREATE_EVENT_INVITEES });

  emitEmailEvent(EmailEvent.CREATE_EVENT_INVITEES, {
    communityId,
    eventId,
    memberIds
  });

  return invitees;
};

export default createEventInvitees;
