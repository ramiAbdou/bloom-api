import BloomManager from '@core/db/BloomManager';
import { Community, Event, User } from '@entities/entities';
import { EmailsContext } from '../emails.types';

export interface CreateEventCoordinatorContext {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<
    Event,
    | 'description'
    | 'endTime'
    | 'googleCalendarEventUrl'
    | 'private'
    | 'startTime'
    | 'title'
  >;
  user: Pick<User, 'email' | 'firstName'>;
}

const prepareCreateEventCoordinatorVars = async (
  context: EmailsContext
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
        fields: [
          'description',
          'endTime',
          'googleCalendarEventId',
          'private',
          'startTime',
          'title'
        ]
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

export default prepareCreateEventCoordinatorVars;
