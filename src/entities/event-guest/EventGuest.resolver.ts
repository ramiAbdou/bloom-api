import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import EventGuest from './EventGuest';
import createEventGuest, {
  CreateEventGuestArgs
} from './repo/createEventGuest';
import deleteEventGuest, {
  DeleteEventGuestArgs
} from './repo/deleteEventGuest';
import listEventGuests, { ListEventGuestsArgs } from './repo/listEventGuests';
import listUpcomingEventGuests from './repo/listUpcomingEventGuests';

@Resolver()
export default class EventGuestResolver {
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuest(
    @Args() args: CreateEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return createEventGuest(args, ctx);
  }

  @Authorized()
  @Mutation(() => EventGuest, { nullable: true })
  async deleteEventGuest(
    @Args() args: DeleteEventGuestArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return deleteEventGuest(args, ctx);
  }

  @Query(() => [EventGuest])
  async listEventGuests(
    @Args() args: ListEventGuestsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest[]> {
    return listEventGuests(args, ctx);
  }

  @Query(() => [EventGuest])
  async listUpcomingEventGuests(@Ctx() ctx: GQLContext): Promise<EventGuest[]> {
    return listUpcomingEventGuests(ctx);
  }
}
