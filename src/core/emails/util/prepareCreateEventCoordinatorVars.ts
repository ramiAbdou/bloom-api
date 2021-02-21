import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import User from '@entities/user/User';
import { EmailsContext } from '../emails.types';

export interface CreateEventCoordinatorContext {
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  event: Pick<Event, 'title'>;
  user: Pick<User, 'email' | 'firstName'>;
}

const prepareCreateEventCoordinatorVars = async (
  context: EmailsContext
): Promise<CreateEventCoordinatorVars[]> => {
  const { coordinatorId, eventId } = context as CreateEventCoordinatorContext;

  const bm = new BloomManager();

  const [event, user]: [Event, User] = await Promise.all([
    bm.findOne(Event, { id: eventId }, { fields: ['title'] }),
    bm.findOne(
      User,
      { members: { id: coordinatorId } },
      { fields: ['email', 'firstName'] }
    )
  ]);

  const variables: CreateEventCoordinatorVars[] = [{ event, user }];

  return variables;
};

export default prepareCreateEventCoordinatorVars;
