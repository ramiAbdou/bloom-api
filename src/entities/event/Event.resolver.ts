import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Event from './Event';
import createEvent, { CreateEventArgs } from './repo/createEvent';
import deleteEvent, { DeleteEventArgs } from './repo/deleteEvent';
import getEvent, { GetEventArgs } from './repo/getEvent';
import getPastEvents from './repo/getPastEvents';
import getUpcomingEvents from './repo/getUpcomingEvents';
import updateEvent, { UpdateEventArgs } from './repo/updateEvent';
import updateRecordingUrl, {
  UpdateRecordingUrlArgs
} from './repo/updateRecordingUrl';

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
  async getEvent(@Args() args: GetEventArgs) {
    return getEvent(args);
  }

  @Authorized()
  @Query(() => [Event])
  async getPastEvents(@Ctx() ctx: GQLContext): Promise<Event[]> {
    return getPastEvents(ctx);
  }

  @Authorized()
  @Query(() => [Event], { nullable: true })
  async getUpcomingEvents(@Ctx() ctx: GQLContext): Promise<Event[]> {
    return getUpcomingEvents(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event, { nullable: true })
  async updateEvent(@Args() args: UpdateEventArgs): Promise<Event> {
    return updateEvent(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Event, { nullable: true })
  async updateRecordingUrl(
    @Args() args: UpdateRecordingUrlArgs
  ): Promise<Event> {
    return updateRecordingUrl(args);
  }
}
