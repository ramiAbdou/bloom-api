/**
 * @fileoverview Resolver: Event
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';
import { JoinEventArgs } from './EventAttendeeArgs';

@Resolver()
export default class EventResolver {
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
