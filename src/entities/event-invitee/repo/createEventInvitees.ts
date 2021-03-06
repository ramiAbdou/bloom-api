import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, MutationEvent } from '@util/events';
import EventInvitee from '../EventInvitee';

export interface CreateEventInviteesArgs {
  eventId: string;
  memberIds: string[];
}

const createEventInvitees = async (
  args: CreateEventInviteesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<EventInvitee[]> => {
  const { eventId, memberIds } = args;
  const { communityId } = ctx;

  if (!memberIds.length) return [];

  const bm = new BloomManager();

  const invitees: EventInvitee[] = memberIds.map((memberId: string) => {
    return bm.create(EventInvitee, { event: eventId, member: memberId });
  });

  await bm.flush({ flushEvent: MutationEvent.CREATE_EVENT_INVITEES });

  emitEmailEvent(EmailEvent.CREATE_EVENT_INVITEES, {
    communityId,
    eventId,
    memberIds
  });

  return invitees;
};

export default createEventInvitees;
