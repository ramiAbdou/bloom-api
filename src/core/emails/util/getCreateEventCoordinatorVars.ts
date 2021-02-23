import BloomManager from '@core/db/BloomManager';
import { Community, Event, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface CreateEventCoordinatorContext {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<
    Event,
    'description' | 'endTime' | 'privacy' | 'startTime' | 'title'
  >;
  user: Pick<User, 'email' | 'firstName'>;
}

const getCreateEventCoordinatorVars = async (
  context: EmailContext
): Promise<CreateEventCoordinatorVars[]> => {
  const {
    communityId,
    coordinatorId,
    eventId
  } = context as CreateEventCoordinatorContext;

  const bm = new BloomManager();

  const [community, event, user]: [Community, Event, User] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { fields: ['name'] }),
    bm.findOne(
      Event,
      { id: eventId },
      {
        fields: ['description', 'endTime', 'private', 'startTime', 'title']
      }
    ),
    bm.findOne(
      User,
      { members: { id: coordinatorId } },
      { fields: ['email', 'firstName'] }
    )
  ]);

  const variables: CreateEventCoordinatorVars[] = [{ community, event, user }];

  return variables;
};

export default getCreateEventCoordinatorVars;
