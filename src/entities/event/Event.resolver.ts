import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Event from './Event';
import createEvent, { CreateEventArgs } from './repo/createEvent';
import deleteEvent, { DeleteEventArgs } from './repo/deleteEvent';
import getEvent, { GetEventArgs } from './repo/getEvent';
import listPastEvents from './repo/listPastEvents';
import listUpcomingEvents from './repo/listUpcomingEvents';
import updateEvent, { UpdateEventArgs } from './repo/updateEvent';

@Resolver()
export default class EventResolver {
  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event, { nullable: true })
  async createEvent(
    @Args() args: CreateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return createEvent(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event)
  async deleteEvent(
    @Args() args: DeleteEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return deleteEvent(args, ctx);
  }

  @Query(() => Event)
  async getEvent(@Args() args: GetEventArgs): Promise<Event> {
    return getEvent(args);
  }

  @Authorized()
  @Query(() => [Event])
  async listPastEvents(@Ctx() ctx: GQLContext): Promise<Event[]> {
    return listPastEvents(ctx);
  }

  @Authorized()
  @Query(() => [Event], { nullable: true })
  async listUpcomingEvents(@Ctx() ctx: GQLContext): Promise<Event[]> {
    return listUpcomingEvents(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event, { nullable: true })
  async updateEvent(@Args() args: UpdateEventArgs): Promise<Event> {
    return updateEvent(args);
  }
}
