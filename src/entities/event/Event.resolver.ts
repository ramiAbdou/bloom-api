import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import Event from './Event';
import createEvent, { CreateEventArgs } from './repo/createEvent';
import deleteEvent, { DeleteEventArgs } from './repo/deleteEvent';
import getEvent, { GetEventArgs } from './repo/getEvent';
import updateEvent, { UpdateEventArgs } from './repo/updateEvent';
import updateRecordingLink, {
  UpdateRecordingLinkArgs
} from './repo/updateRecordingLink';

@Resolver()
export default class EventResolver {
  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async createEvent(
    @Args() args: CreateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return createEvent(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async deleteEvent(
    @Args() args: DeleteEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<boolean> {
    return deleteEvent(args, ctx);
  }

  @Query(() => Event)
  async getEvent(@Args() args: GetEventArgs) {
    return getEvent(args);
  }

  @Authorized()
  @Query(() => [Event], { nullable: true })
  async getPastEvents(@Ctx() { communityId }: GQLContext): Promise<Event[]> {
    return new BloomManager().find(
      Event,
      { community: { id: communityId }, endTime: { $lt: now() } },
      {
        cacheKey: `${QueryEvent.GET_PAST_EVENTS}-${communityId}`,
        orderBy: { startTime: QueryOrder.DESC }
      }
    );
  }

  @Authorized()
  @Query(() => [Event], { nullable: true })
  async getUpcomingEvents(
    @Ctx() { communityId }: GQLContext
  ): Promise<Event[]> {
    return new BloomManager().find(
      Event,
      { community: { id: communityId }, endTime: { $gte: now() } },
      {
        cacheKey: `${QueryEvent.GET_UPCOMING_EVENTS}-${communityId}`,
        orderBy: { startTime: QueryOrder.ASC }
      }
    );
  }

  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async updateEvent(
    @Args() args: UpdateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return updateEvent(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async updateRecordingLink(
    @Args() args: UpdateRecordingLinkArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return updateRecordingLink(args, ctx);
  }
}
