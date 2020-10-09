/**
 * @fileoverview Resolver: EventAttendee
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';
import { JoinEventArgs } from './EventAttendeeArgs';

@Resolver()
export default class EventAttendeeResolver {
  @Mutation(() => Boolean, { nullable: true })
  async joinEvent(
    @Args() { eventId, fullName, email }: JoinEventArgs,
    @Ctx() { userId }: GQLContext
  ): Promise<void> {
    return userId
      ? new BloomManager().eventAttendeeRepo().joinEventAsUser(eventId, userId)
      : new BloomManager()
          .eventAttendeeRepo()
          .joinEventAsGuest(eventId, fullName, email);
  }
}
