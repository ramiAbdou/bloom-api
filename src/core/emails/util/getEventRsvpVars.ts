import jwt from 'jsonwebtoken';

import { APP, JWT } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community, Event, EventGuest, User } from '@entities/entities';
import { VerifiedToken } from '@entities/user/repo/verifyToken';
import { VerifyEvent } from '@util/events';
import URLBuilder from '@util/URLBuilder';
import { EmailContext } from '../emails.types';

export interface EventRsvpContext {
  communityId: string;
  eventId: string;
  guestId: string;
}

export interface EventRsvpVars {
  event: Pick<Event, 'title'>;
  joinUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const getEventRsvpVars = async (
  context: EmailContext
): Promise<EventRsvpVars[]> => {
  const { communityId, eventId, guestId } = context as EventRsvpContext;

  const bm = new BloomManager();

  const [community, event, guest]: [
    Community,
    Event,
    EventGuest
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }),
    bm.findOne(Event, { id: eventId }),
    bm.findOne(EventGuest, { id: guestId })
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

  const joinUrl: string = new URLBuilder(
    `${APP.CLIENT_URL}/${community.urlName}/events/${eventId}`
  ).addParam('token', token).url;

  const variables: EventRsvpVars[] = [
    {
      event: { title: event.title },
      joinUrl,
      user: { email: guest.email, firstName: guest.firstName }
    }
  ];

  return variables;
};

export default getEventRsvpVars;
