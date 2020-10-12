/**
 * @fileoverview Resolver: Event
 * @author Rami Abdou
 */

import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver
} from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@util/db/BloomManager';
import Event from './Event';
import { CreateEventArgs } from './EventArgs';

@Resolver()
export default class EventResolver {
  @Authorized()
  @Mutation(() => Event, { nullable: true })
  async createEvent(
    @Args() args: CreateEventArgs,
    @Ctx() { communityId }: GQLContext
  ) {
    return new BloomManager().eventRepo().createEvent({ ...args }, communityId);
  }

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
