import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
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
  member: Pick<Member, 'email' | 'firstName'>;
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

  const [community, event, member]: [
    Community,
    Event,
    Member
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { fields: ['name'] }),
    bm.findOne(
      Event,
      { id: eventId },
      { fields: ['endTime', 'privacy', 'startTime', 'summary', 'title'] }
    ),
    bm.findOne(
      Member,
      { id: coordinatorId },
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
    { community: partialCommunity, event: partialEvent, member }
  ];

  return variables;
};

export default getCreateEventCoordinatorVars;
