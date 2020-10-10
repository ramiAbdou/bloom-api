/**
 * @fileoverview Resolver: Event
 * @author Rami Abdou
 */

import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Event from './Event';

@Resolver()
export default class EventResolver {
  @Query(() => Event, { nullable: true })
  async getEvent(
    @Arg('eventShortId') shortId: number,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager()
      .eventRepo()
      .findOne({ community: { id: communityId }, shortId });
  }
}
