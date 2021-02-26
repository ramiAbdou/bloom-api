import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent, emitGoogleEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent, GoogleEvent } from '@util/events';
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

const createEvent = async (
  { invitees: memberIdsToInvite, ...args }: CreateEventArgs,
  { communityId, memberId }: GQLContext
): Promise<Event> => {
  const event: Event = await new BloomManager().createAndFlush(
    Event,
    { ...args, community: communityId },
    { flushEvent: FlushEvent.CREATE_EVENT }
  );

  await createEventInvitees(
    { eventId: event.id, memberIds: memberIdsToInvite },
    { communityId }
  );

  emitEmailEvent(EmailEvent.CREATE_EVENT_COORDINATOR, {
    communityId,
    coordinatorId: memberId,
    eventId: event.id
  });

  emitGoogleEvent(GoogleEvent.CREATE_CALENDAR_EVENT, {
    eventId: event.id
  });

  return event;
};

export default createEvent;
