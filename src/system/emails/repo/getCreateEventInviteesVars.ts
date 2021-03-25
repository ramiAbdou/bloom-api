import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { EmailPayload } from '../emails.types';
import { stringifyEmailTimestamp } from '../emails.util';

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
  member: Pick<Member, 'email' | 'firstName'>;
}

const getCreateEventInviteesVars = async (
  context: EmailPayload
): Promise<CreateEventInviteesVars[]> => {
  const {
    communityId,
    eventId,
    memberIds
  } = context as CreateEventInviteesPayload;

  const bm: BloomManager = new BloomManager();

  const [community, event, members]: [
    Community,
    Event,
    Member[]
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }),
    bm.find(Member, { id: memberIds })
  ]);

  const partialCommunity: Pick<Community, 'name'> = { name: community.name };

  const partialEvent: Pick<
    Event,
    'endTime' | 'eventUrl' | 'privacy' | 'startTime' | 'summary' | 'title'
  > = {
    endTime: stringifyEmailTimestamp(event.endTime),
    // @ts-ignore b/c we need to await the call.
    eventUrl: await event.eventUrl(),
    privacy: event.privacy,
    startTime: stringifyEmailTimestamp(event.startTime),
    summary: event.summary,
    title: event.title
  };

  const variables: CreateEventInviteesVars[] = members.map((member: Member) => {
    return {
      community: partialCommunity,
      event: partialEvent,
      member: { email: member.email, firstName: member.firstName }
    };
  });

  return variables;
};

export default getCreateEventInviteesVars;
