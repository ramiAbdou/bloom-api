import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import EventAttendee from './EventAttendee';
import createEventAttendee, {
  CreateEventAttendeeArgs
} from './repo/createEventAttendee';
import getEventAttendeesSeries from './repo/getEventAttendeesSeries';
import listEventAttendees, {
  ListEventAttendeesArgs
} from './repo/listEventAttendees';

@Resolver()
export default class EventAttendeeResolver {
  @Mutation(() => EventAttendee)
  async createEventAttendee(
    @Args() args: CreateEventAttendeeArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventAttendee> {
    return createEventAttendee(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getEventAttendeesSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getEventAttendeesSeries(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Query(() => [EventAttendee])
  async listEventAttendees(
    @Args() args: ListEventAttendeesArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventAttendee[]> {
    return listEventAttendees(args, ctx);
  }
}
