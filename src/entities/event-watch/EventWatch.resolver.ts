import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import EventWatch from './EventWatch';
import createEventWatch, {
  CreateEventWatchArgs
} from './repo/createEventWatch';
import listEventWatches, {
  ListEventWatchesArgs
} from './repo/listEventWatches';

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

  @Authorized()
  @Query(() => [EventWatch])
  async listEventWatches(
    @Args() args: ListEventWatchesArgs
  ): Promise<EventWatch[]> {
    return listEventWatches(args);
  }
}
