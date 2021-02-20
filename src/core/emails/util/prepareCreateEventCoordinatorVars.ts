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
  event: Event;
  user: User;
}

const prepareCreateEventCoordinatorVars = async (
  context: EmailsContext
): Promise<CreateEventCoordinatorVars[]> => {
  const { coordinatorId, eventId } = context as CreateEventCoordinatorContext;

  const bm = new BloomManager();

  const [coordinator, event]: [Member, Event] = await Promise.all([
    bm.findOne(Member, { id: coordinatorId }, { populate: ['user'] }),
    bm.findOne(Event, { id: eventId })
  ]);

  const variables: CreateEventCoordinatorVars[] = [
    { event, user: coordinator.user }
  ];

  return variables;
};

export default prepareCreateEventCoordinatorVars;
