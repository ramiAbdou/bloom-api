import { findOne } from '@core/db/db.util';
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

const getCreateEventCoordinatorVars = async ({
  communityId,
  coordinatorId,
  eventId
}: CreateEventCoordinatorPayload): Promise<CreateEventCoordinatorVars[]> => {
  const [community, event, member]: [
    Community,
    Event,
    Member
  ] = await Promise.all([
    findOne(Community, { id: communityId }),
    findOne(
      Event,
      { id: eventId },
      { fields: ['endTime', 'privacy', 'startTime', 'summary', 'title'] }
    ),
    findOne(Member, { id: coordinatorId }, { fields: ['email', 'firstName'] })
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
