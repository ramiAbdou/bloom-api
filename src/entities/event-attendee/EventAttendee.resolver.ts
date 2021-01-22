import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import EventAttendee from './EventAttendee';
import createEventAttendee, {
  CreateEventAttendeeArgs
} from './repo/createEventAttendee';

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
}
