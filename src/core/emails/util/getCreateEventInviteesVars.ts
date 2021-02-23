import BloomManager from '@core/db/BloomManager';
import { Community, Event, User } from '@entities/entities';
import { EmailContext } from '../emails.types';

export interface CreateEventInviteesContext {
  communityId: string;
  eventId: string;
  memberIds: string[];
}

export interface CreateEventInviteesVars {
  community: Community;
  event: Pick<
    Event,
    'endTime' | 'eventUrl' | 'privacy' | 'startTime' | 'summary' | 'title'
  >;
  user: Pick<User, 'email' | 'firstName'>;
}

const getCreateEventInviteesVars = async (
  context: EmailContext
): Promise<CreateEventInviteesVars[]> => {
  const {
    communityId,
    eventId,
    memberIds
  } = context as CreateEventInviteesContext;

  const bm = new BloomManager();

  const [community, event, users]: [
    Community,
    Event,
    User[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { fields: ['name'] }),
    bm.findOne(
      Event,
      { id: eventId },
      { fields: ['endTime', 'privacy', 'startTime', 'summary', 'title'] }
    ),
    bm.find(
      User,
      { members: { id: memberIds } },
      { fields: ['email', 'firstName'] }
    )
  ]);

  const eventUrl = await event.eventUrl;

  const variables: CreateEventInviteesVars[] = users.map((user: User) => {
    return { community, event: { ...event, eventUrl }, user };
  });

  return variables;
};

export default getCreateEventInviteesVars;
