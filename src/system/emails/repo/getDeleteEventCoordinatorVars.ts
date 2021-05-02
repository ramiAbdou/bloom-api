import BloomManager from '@core/db/BloomManager';
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
const getDeleteEventCoordinatorVars = async (
  context: DeleteEventCoordinatorPayload
): Promise<DeleteEventCoordinatorVars[]> => {
  const { communityId, coordinatorId, eventId } = context;

  const bm: BloomManager = new BloomManager();

  const [community, event, member]: [
    Community,
    Event,
    Member
  ] = await Promise.all([
    bm.em.findOne(Community, { id: communityId }),
    bm.em.findOne(Event, { id: eventId }, { filters: false }),
    bm.em.findOne(Member, { id: coordinatorId })
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
