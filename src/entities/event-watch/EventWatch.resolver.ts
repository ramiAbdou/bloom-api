import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import EventWatch from './EventWatch';
import createEventWatch, {
  CreateEventWatchArgs
} from './repo/createEventWatch';

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
}
