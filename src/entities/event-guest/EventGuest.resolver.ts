import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import EventGuest from './EventGuest';
import createEventGuest, {
  CreateEventGuestArgs
} from './repo/createEventGuest';
import deleteEventGuest, {
  DeleteEventGuestArgs
} from './repo/deleteEventGuest';
import getEventGuests, { GetEventGuestsArgs } from './repo/getEventGuests';
import getPastEventGuests from './repo/getPastEventGuests';
import getUpcomingEventGuests from './repo/getUpcomingEventGuests';
import verifyEventJoinToken, {
  VerifyEventJoinTokenArgs
} from './repo/verifyEventJoinToken';

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
  async getEventGuests(
    @Args() args: GetEventGuestsArgs
  ): Promise<EventGuest[]> {
    return getEventGuests(args);
  }

  @Query(() => [EventGuest])
  async getPastEventGuests(@Ctx() ctx: GQLContext): Promise<EventGuest[]> {
    return getPastEventGuests(ctx);
  }

  @Query(() => [EventGuest])
  async getUpcomingEventGuests(@Ctx() ctx: GQLContext): Promise<EventGuest[]> {
    return getUpcomingEventGuests(ctx);
  }

  @Mutation(() => Boolean)
  async verifyEventJoinToken(@Args() args: VerifyEventJoinTokenArgs) {
    return verifyEventJoinToken(args);
  }
}
