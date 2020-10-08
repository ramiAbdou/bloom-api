/**
 * @fileoverview Resolver: Event
 * @author Rami Abdou
 */

import { Args, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '../../util/db/BloomManager';
import { JoinEventArgs } from './EventAttendeeArgs';

@Resolver()
export default class EventResolver {
  @Mutation(() => Boolean, { nullable: true })
  async joinEvent(
    @Args() { eventId, fullName, email }: JoinEventArgs,
    @Ctx() { userId }: GQLContext
  ): Promise<void> {
    const bm = new BloomManager();
    if (userId) return bm.eventAttendeeRepo().joinEventAsUser(eventId, userId);
    return bm.eventAttendeeRepo().joinEventAsGuest(eventId, fullName, email);
  }
}
