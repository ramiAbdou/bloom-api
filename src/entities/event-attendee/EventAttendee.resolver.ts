import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import EventAttendee from './EventAttendee';
import createEventAttendee, {
  CreateEventAttendeeArgs
} from './repo/createEventAttendee';
import getEventAttendees, {
  GetEventAttendeesArgs
} from './repo/getEventAttendees';

@Resolver()
export default class EventAttendeeResolver {
  @Authorized()
  @Mutation(() => EventAttendee, { nullable: true })
  async createEventAttendee(
    @Args() args: CreateEventAttendeeArgs,
    @Ctx() ctx: GQLContext
  ): Promise<EventAttendee> {
    return createEventAttendee(args, ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [EventAttendee])
  async getEventAttendees(
    @Args() args: GetEventAttendeesArgs
  ): Promise<EventAttendee[]> {
    return getEventAttendees(args);
  }
}
