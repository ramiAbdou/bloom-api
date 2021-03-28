import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import emitGoogleEvent from '@system/events/repo/emitGoogleEvent';
import emitTaskEvent from '@system/events/repo/emitTaskEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent, GoogleEvent, TaskEvent } from '@util/constants.events';
import createEventInvitees from '../../event-invitee/repo/createEventInvitees';
import Event, { EventPrivacy } from '../Event';

@ArgsType()
export class CreateEventArgs {
  @Field()
  description: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [String])
  invitees?: string[];

  @Field(() => String, { defaultValue: EventPrivacy.MEMBERS_ONLY })
  privacy: EventPrivacy;

  @Field()
  startTime: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  title: string;

  @Field()
  videoUrl: string;
}

/**
 * Returns a new Event.
 *
 * @param args - Event data (eg: description, endTime, startTime).
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createEvent = async (
  args: CreateEventArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Event> => {
  const { communityId, memberId } = ctx;
  const { invitees: memberIdsToInvite, ...eventData } = args;

  const event: Event = await new BloomManager().createAndFlush(Event, {
    ...eventData,
    community: communityId
  });

  const eventId: string = event.id;

  await createEventInvitees(
    { eventId, memberIds: memberIdsToInvite },
    { communityId }
  );

  emitEmailEvent(EmailEvent.CREATE_EVENT_COORDINATOR, {
    communityId,
    coordinatorId: memberId,
    eventId
  });

  emitGoogleEvent(GoogleEvent.CREATE_CALENDAR_EVENT, { eventId });
  emitTaskEvent(TaskEvent.EVENT_REMINDER_1_DAY, { eventId });
  emitTaskEvent(TaskEvent.EVENT_REMINDER_1_HOUR, { eventId });

  return event;
};

export default createEvent;
