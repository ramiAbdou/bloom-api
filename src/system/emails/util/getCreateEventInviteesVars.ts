import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface CreateEventInviteesPayload {
  communityId: string;
  eventId: string;
  memberIds: string[];
}

export interface CreateEventInviteesVars {
  community: Pick<Community, 'name'>;
  event: Pick<
    Event,
    'endTime' | 'eventUrl' | 'privacy' | 'startTime' | 'summary' | 'title'
  >;
  user: Pick<User, 'email' | 'firstName'>;
}

const getCreateEventInviteesVars = async (
  context: EmailPayload
): Promise<CreateEventInviteesVars[]> => {
  const {
    communityId,
    eventId,
    memberIds
  } = context as CreateEventInviteesPayload;

  const bm = new BloomManager();

  const [community, event, users]: [
    Community,
    Event,
    User[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }),
    bm.find(User, { members: { id: memberIds } })
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

  const variables: CreateEventInviteesVars[] = users.map((user: User) => {
    return {
      community: partialCommunity,
      event: partialEvent,
      user: { email: user.email, firstName: user.firstName }
    };
  });

  return variables;
};

export default getCreateEventInviteesVars;
