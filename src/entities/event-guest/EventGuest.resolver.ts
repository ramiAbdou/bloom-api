import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import EventGuest from './EventGuest';
import createEventGuestWithSupporter, {
  CreateEventGuestWithSupporterArgs
} from './repo/createEventGuestWithSupporter';
import deleteEventGuest, {
  DeleteEventGuestArgs
} from './repo/deleteEventGuest';

@Resolver()
export default class EventGuestResolver {
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuestWithSupporter(
    @Args() args: CreateEventGuestWithSupporterArgs
  ): Promise<EventGuest> {
    return createEventGuestWithSupporter(args);
  }

  @Authorized()
  @Mutation(() => EventGuest, { nullable: true })
  async deleteEventGuest(
    @Args() args: DeleteEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return deleteEventGuest(args, ctx);
  }
}
