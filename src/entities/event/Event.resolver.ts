import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import { TimeSeriesData } from '@util/gql.types';
import Event from './Event';
import createEvent, { CreateEventArgs } from './repo/createEvent';
import deleteEvent, { DeleteEventArgs } from './repo/deleteEvent';
import getEvent, { GetEventArgs } from './repo/getEvent';
import getEventGuestSeries from './repo/getEventGuestSeries';
import updateEvent, { UpdateEventArgs } from './repo/updateEvent';
import updateRecordingLink, {
  UpdateRecordingLinkArgs
} from './repo/updateRecordingLink';

@Resolver()
export default class EventResolver {
  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async createEvent(
    @Args() args: CreateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return createEvent(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Boolean, { nullable: true })
  async deleteEvent(
    @Args() args: DeleteEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<boolean> {
    return deleteEvent(args, ctx);
  }

  @Authorized()
  @Query(() => Event)
  async getEvent(@Args() args: GetEventArgs) {
    return getEvent(args);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getEventGuestSeries(
    @Args() args: GetEventArgs
  ): Promise<TimeSeriesData[]> {
    return getEventGuestSeries(args);
  }

  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async updateEvent(
    @Args() args: UpdateEventArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Event> {
    return updateEvent(args, ctx);
  }

  @Authorized('ADMIN')
  @Mutation(() => Event, { nullable: true })
  async updateRecordingLink(
    @Args() args: UpdateRecordingLinkArgs
  ): Promise<Event> {
    return updateRecordingLink(args);
  }
}
