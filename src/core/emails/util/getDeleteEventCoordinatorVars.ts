import BloomManager from '@core/db/BloomManager';
import { Community, Event, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface DeleteEventCoordinatorContext {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface DeleteEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'title'>;
  user: Pick<User, 'email' | 'firstName'>;
}

/**
 * Returns the variables for the DELETE_EVENT_COORDINATOR email.
 *
 * @param {string} context.communityId
 * @param {string} context.coordinatorId
 * @param {string} context.eventId
 */
const getDeleteEventCoordinatorVars = async (
  context: EmailContext
): Promise<DeleteEventCoordinatorVars[]> => {
  const {
    communityId,
    coordinatorId,
    eventId
  } = context as DeleteEventCoordinatorContext;

  const bm = new BloomManager();

  const [community, event, user]: [Community, Event, User] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }, { filters: false }),
    bm.findOne(User, { members: { id: coordinatorId } })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };
  const partialEvent: Pick<Event, 'title'> = { title: event.title };

  const partialUser: Pick<User, 'email' | 'firstName'> = {
    email: user.email,
    firstName: user.firstName
  };

  const variables: DeleteEventCoordinatorVars[] = [
    { community: partialCommunity, event: partialEvent, user: partialUser }
  ];

  return variables;
};

export default getDeleteEventCoordinatorVars;
