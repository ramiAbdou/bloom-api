import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { VerifiedToken } from '@entities/user/repo/verifyToken';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';
import { EmailPayload } from '../emails.types';

export interface EventRsvpPayload {
  communityId: string;
  eventId: string;
  guestId: string;
}

export interface EventRsvpVars {
  event: Pick<Event, 'title'>;
  joinUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailPayload
): Promise<EventRsvpVars[]> => {
  const { communityId, eventId, guestId } = context as EventRsvpPayload;

  const bm: BloomManager = new BloomManager();

  const [community, event, guest]: [
    Community,
    Event,
    EventGuest
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }),
    bm.findOne(
      EventGuest,
      { id: guestId },
      { populate: ['member', 'supporter'] }
    )
  ]);

  const token: string = signToken({
    expires: false,
    payload: {
      communityId,
      event: VerifyEvent.JOIN_EVENT,
      eventId,
      memberId: guest.member.id
    } as VerifiedToken
  });

  const joinUrl: string = buildUrl({
    params: { token },
    url: `${APP.CLIENT_URL}/${community.urlName}/events/${eventId}`
  });

  const variables: EventRsvpVars[] = [
    {
      event: { title: event.title },
      joinUrl,
      member: {
        email: guest.member?.email ?? guest.supporter?.email,
        firstName: guest.member?.firstName ?? guest?.supporter?.firstName
      }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
