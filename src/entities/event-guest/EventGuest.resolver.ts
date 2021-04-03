import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import EventGuest from './EventGuest';
import createEventGuestWithMember, {
  CreateEventGuestWithMemberArgs
} from './repo/createEventGuestWithMember';
import createEventGuestWithSupporter, {
  CreateEventGuestWithSupporterArgs
} from './repo/createEventGuestWithSupporter';
import deleteEventGuest, {
  DeleteEventGuestArgs
} from './repo/deleteEventGuest';
import listEventGuests, { ListEventGuestsArgs } from './repo/listEventGuests';

@Resolver()
export default class EventGuestResolver {
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuestWithMember(
    @Args() args: CreateEventGuestWithMemberArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest> {
    return createEventGuestWithMember(args, ctx);
  }

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

  @Query(() => [EventGuest])
  async listEventGuests(
    @Args() args: ListEventGuestsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventGuest[]> {
    return listEventGuests(args, ctx);
  }
}
