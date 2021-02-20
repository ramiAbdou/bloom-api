import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import Event from '../../entities/event/Event';
import Member from '../../entities/member/Member';
import formatPersonalizations from './formatPersonalizations';

export interface CreateEventCoordinatorContext {
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  event: Event;
  user: User;
}

const prepareCreateEventCoordinatorEmail = async (
  context: CreateEventCoordinatorContext
) => {
  const bm = new BloomManager();

  const [coordinator, event]: [Member, Event] = await Promise.all([
    bm.findOne(Member, { id: context?.coordinatorId }, { populate: ['user'] }),
    bm.findOne(Event, { id: context?.eventId })
  ]);

  const variables: CreateEventCoordinatorVars[] = [
    { event, user: coordinator.user }
  ];

  return formatPersonalizations(variables);
};

export default prepareCreateEventCoordinatorEmail;
