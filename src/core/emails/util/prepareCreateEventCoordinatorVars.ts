import BloomManager from '@core/db/BloomManager';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
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

  const [coordinator, event]: [Member, Event] = await Promise.all([
    bm.findOne(
      Member,
      { id: coordinatorId },
      { fields: [{ user: ['email', 'firstName'] }] }
    ),
    bm.findOne(Event, { id: eventId }, { fields: ['title'] })
  ]);

  const variables: CreateEventCoordinatorVars[] = [
    { event, user: coordinator.user }
  ];

  return variables;
};

export default prepareCreateEventCoordinatorVars;
