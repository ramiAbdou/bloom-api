import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface CreateEventCoordinatorPayload {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<
    Event,
    'endTime' | 'eventUrl' | 'privacy' | 'startTime' | 'summary' | 'title'
  >;
  user: Pick<User, 'email' | 'firstName'>;
}

const getCreateEventCoordinatorVars = async (
  context: EmailPayload
): Promise<CreateEventCoordinatorVars[]> => {
  const {
    communityId,
    coordinatorId,
    eventId
  } = context as CreateEventCoordinatorPayload;

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

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialEvent: Pick<
    Event,
    'endTime' | 'eventUrl' | 'privacy' | 'startTime' | 'summary' | 'title'
  > = {
    endTime: event.endTime,
    eventUrl: await event.eventUrl,
    privacy: event.privacy,
    startTime: event.startTime,
    summary: event.summary,
    title: event.title
  };

  const variables: CreateEventCoordinatorVars[] = [
    { community: partialCommunity, event: partialEvent, user }
  ];

  return variables;
};

export default getCreateEventCoordinatorVars;