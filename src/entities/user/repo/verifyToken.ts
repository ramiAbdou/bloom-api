import day, { Dayjs } from 'dayjs';
import express from 'express';
import { Field, ObjectType } from 'type-graphql';

import { createAndFlush, findOne } from '@core/db/db.util';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import { GQLContext } from '@util/constants';
import { ErrorType } from '@util/constants.errors';
import { VerifyEvent } from '@util/constants.events';
import { TokenArgs } from '@util/constants.gql';
import { decodeToken } from '@util/util';
import Event from '../../event/Event';
import refreshToken from './refreshToken';

@ObjectType()
export class VerifiedToken {
  @Field(() => String, { nullable: true })
  event?: VerifyEvent;

  @Field({ nullable: true })
  guestId?: string;

  @Field({ nullable: true })
  userId?: string;
}

interface HandleJoinEventArgs {
  guestId: string;
}

const handleJoinEvent = async ({ guestId }: HandleJoinEventArgs) => {
  const eventGuest: EventGuest = await findOne(
    EventGuest,
    { id: guestId },
    { populate: ['event'] }
  );

  const { endTime, id: eventId, startTime }: Event = eventGuest.event;

  const tenMinutesBeforeEvent: Dayjs = day
    .utc(startTime)
    .subtract(10, 'minute');

  const tenMinutesAfterEvent: Dayjs = day.utc(endTime).add(10, 'minute');

  if (day.utc().isBefore(tenMinutesBeforeEvent)) {
    throw new Error(ErrorType.EVENT_HASNT_STARTED);
  }

  if (day.utc().isAfter(tenMinutesAfterEvent)) {
    throw new Error(ErrorType.EVENT_FINISHED);
  }

  await createAndFlush(
    EventAttendee,
    eventGuest.member.id
      ? { event: eventId, member: eventGuest.member.id }
      : { event: eventId, supporter: eventGuest.supporter.id }
  );
};

interface HandleLoginArgs {
  res: express.Response;
  userId: string;
}

const handleLogin = async ({ res, userId }: HandleLoginArgs) => {
  await refreshToken({ id: userId }, { res });
};

/**
 * Returns the VerifiedToken based on the VerifyEvent that is supplied.
 *
 * @param args.token - JWT token to decode and process.
 * @param ctx.res - Express response object.
 */
const verifyToken = async (
  { token }: TokenArgs,
  { res }: Pick<GQLContext, 'res'>
): Promise<VerifiedToken> => {
  const verifiedToken: VerifiedToken = decodeToken(token) ?? {};
  const { event, guestId, userId } = verifiedToken;

  console.log(verifiedToken);

  switch (event) {
    case VerifyEvent.JOIN_EVENT:
      await handleJoinEvent({ guestId });
      break;

    case VerifyEvent.LOGIN:
      await handleLogin({ res, userId });
      break;

    default:
      await handleLogin({ res, userId });
      break;
  }

  // if (event === VerifyEvent.JOIN_EVENT && memberId) {
  //   await createEventAttendeeWithMember({ eventId }, { memberId });
  // }

  // if (event === VerifyEvent.JOIN_EVENT && supporterId) {
  //   await createEventAttendeeWithSupporter({ eventId, supporterId });
  // }

  return verifiedToken;
};

export default verifyToken;
