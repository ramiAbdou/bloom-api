import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { MemberRole } from '@entities/member/Member';
import EventWatch from './EventWatch';
import createEventWatch, {
  CreateEventWatchArgs
} from './repo/createEventWatch';
import getEventWatches, { GetEventWatchesArgs } from './repo/getEventWatches';
import getPastEventWatches from './repo/getPastEventWatches';

@Resolver()
export default class EventWatchResolver {
  @Authorized()
  @Mutation(() => EventWatch)
  async createEventWatch(
    @Args() args: CreateEventWatchArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventWatch> {
    return createEventWatch(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [EventWatch])
  async getEventWatches(
    @Args() args: GetEventWatchesArgs
  ): Promise<EventWatch[]> {
    return getEventWatches(args);
  }

  @Query(() => [EventWatch])
  async getPastEventWatches(@Ctx() ctx: GQLContext): Promise<EventWatch[]> {
    return getPastEventWatches(ctx);
  }
}
