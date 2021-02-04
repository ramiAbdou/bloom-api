import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import getPastEventAttendees from '../event-attendee/repo/getPastEventAttendees';
import EventWatch from './EventWatch';
import createEventWatch, {
  CreateEventWatchArgs
} from './repo/createEventWatch';
import getEventWatches, { GetEventWatchesArgs } from './repo/getEventWatches';

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

  @Authorized('ADMIN')
  @Query(() => [EventWatch])
  async getEventWatches(
    @Args() args: GetEventWatchesArgs
  ): Promise<EventWatch[]> {
    return getEventWatches(args);
  }

  @Query(() => [EventWatch])
  async getPastEventAttendees(@Ctx() ctx: GQLContext): Promise<EventWatch[]> {
    return getPastEventAttendees(ctx);
  }
}
