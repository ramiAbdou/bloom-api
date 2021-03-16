import jwt from 'jsonwebtoken';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import EventGuest from '@entities/event-guest/EventGuest';
import Event from '@entities/event/Event';
import Member from '@entities/member/Member';
import { VerifiedToken } from '@entities/user/repo/verifyToken';
import { APP, JWT } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl } from '@util/util';
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

  const bm = new BloomManager();

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

  if (!guest) throw new Error('Event guest no longer exists.');

  const token: string = jwt.sign(
    {
      event: VerifyEvent.JOIN_EVENT,
      guestId,
      memberId: guest.member.id
    } as VerifiedToken,
    JWT.SECRET
  );

  const joinUrl: string = buildUrl(
    `${APP.CLIENT_URL}/${community.urlName}/events/${eventId}`,
    { token }
  );

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
