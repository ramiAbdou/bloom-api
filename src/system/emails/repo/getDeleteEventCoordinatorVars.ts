import { findOne } from '@core/db/db.util';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';

export interface DeleteEventCoordinatorPayload {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface DeleteEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'title'>;
  member: Pick<Member, 'email' | 'firstName'>;
}

/**
 * Returns the variables for the DELETE_EVENT_COORDINATOR email.
 *
 * @param context.communityId - ID of the Community.
 * @param context.coordinatorId - ID of the Member (coordinator).
 * @param context.eventId - ID of the Event.
 */
const getDeleteEventCoordinatorVars = async ({
  communityId,
  coordinatorId,
  eventId
}: DeleteEventCoordinatorPayload): Promise<DeleteEventCoordinatorVars[]> => {
  const [community, event, member]: [
    Community,
    Event,
    Member
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(Event, { id: eventId }, { filters: false }),
    findOne(Member, { id: coordinatorId })
  ]);

  const variables: DeleteEventCoordinatorVars[] = [
    {
      community: { name: community.name },
      event: { title: event.title },
      member: { email: member.email, firstName: member.firstName }
    }
  ];

  return variables;
};

export default getDeleteEventCoordinatorVars;
