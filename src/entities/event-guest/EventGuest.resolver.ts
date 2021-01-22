import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import EventGuest from './EventGuest';
import createEventGuest, {
  CreateEventGuestArgs
} from './repo/createEventGuest';

@Resolver()
export default class EventGuestResolver {
  @Authorized()
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuest(
    @Args() args: CreateEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return createEventGuest(args, ctx);
  }

  @Authorized()
  @Query(() => [EventGuest])
  async getMemberUpcomingEvents(@Ctx() { memberId }: GQLContext) {
    return new BloomManager().find(
      EventGuest,
      { member: { id: memberId } },
      {
        cacheKey: `${QueryEvent.GET_MEMBER_UPCOMING_EVENTS}-${memberId}`,
        orderBy: { event: { startTime: QueryOrder.ASC } },
        populate: ['event', 'member']
      }
    );
  }
}
