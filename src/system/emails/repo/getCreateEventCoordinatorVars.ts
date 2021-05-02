import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { stringifyEmailTimestamp } from '../emails.util';

export interface CreateEventCoordinatorPayload {
  communityId: string;
  coordinatorId: string;
  eventId: string;
}

export interface CreateEventCoordinatorVars {
  community: Pick<Community, 'name'>;
  event: Pick<Event, 'endTime' | 'privacy' | 'startTime' | 'summary' | 'title'>;
  eventUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getCreateEventCoordinatorVars = async (
  context: CreateEventCoordinatorPayload
): Promise<CreateEventCoordinatorVars[]> => {
  const { communityId, coordinatorId, eventId } = context;

  const bm: BloomManager = new BloomManager();

  const [community, event, member]: [
    Community,
    Event,
    Member
  ] = await Promise.all([
    bm.em.findOne(Community, { id: communityId }),
    bm.em.findOne(
      Event,
      { id: eventId },
      { fields: ['endTime', 'privacy', 'startTime', 'summary', 'title'] }
    ),
    bm.em.findOne(
      Member,
      { id: coordinatorId },
      { fields: ['email', 'firstName'] }
    )
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialEvent: Pick<
    Event,
    'endTime' | 'privacy' | 'startTime' | 'summary' | 'title'
  > = {
    endTime: stringifyEmailTimestamp(event.endTime),
    privacy: event.privacy,
    startTime: stringifyEmailTimestamp(event.startTime),
    summary: event.summary,
    title: event.title
  };

  const variables: CreateEventCoordinatorVars[] = [
    {
      community: partialCommunity,
      event: partialEvent,
      eventUrl: await event.eventUrl(),
      member
    }
  ];

  return variables;
};

export default getCreateEventCoordinatorVars;
