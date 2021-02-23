import BloomManager from '@core/db/BloomManager';
import { Community, Event, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface CreateEventCoordinatorContext {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  community: Community;
  event: Event;
  eventUrl: string;
  user: User;
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
      { fields: ['endTime', 'privacy', 'startTime', 'summary', 'title'] }
    ),
    bm.findOne(
      User,
      { members: { id: coordinatorId } },
      { fields: ['email', 'firstName'] }
    )
  ]);

  const variables: CreateEventCoordinatorVars[] = [
    {
      community,
      event,
      eventUrl: await event.eventUrl(),
      user
    }
  ];

  console.log(variables);

  return variables;
};

export default getCreateEventCoordinatorVars;
