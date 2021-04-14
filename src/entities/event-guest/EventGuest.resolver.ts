import { Args, Mutation, Resolver } from 'type-graphql';

import EventGuest from './EventGuest';
import createEventGuestWithSupporter, {
  CreateEventGuestWithSupporterArgs
} from './repo/createEventGuestWithSupporter';

@Resolver()
export default class EventGuestResolver {
  @Mutation(() => EventGuest, { nullable: true })
  async createEventGuestWithSupporter(
    @Args() args: CreateEventGuestWithSupporterArgs
  ): Promise<EventGuest> {
    return createEventGuestWithSupporter(args);
  }
}
