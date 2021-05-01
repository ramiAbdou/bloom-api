import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import { HasuraRole } from '../../integrations/hasura/Hasura.types';
import EventAttendee from './EventAttendee';
import createEventAttendeeWithSupporter, {
  CreateEventAttendeeWithSupporterArgs
} from './repo/createEventAttendeeWithSupporter';
import getEventAttendeesSeries from './repo/getEventAttendeesSeries';

@Resolver()
export default class EventAttendeeResolver {
  @Mutation(() => EventAttendee)
  async createEventAttendeeWithSupporter(
    @Args() args: CreateEventAttendeeWithSupporterArgs
  ): Promise<EventAttendee> {
    return createEventAttendeeWithSupporter(args);
  }

  @Authorized(HasuraRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getEventAttendeesSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getEventAttendeesSeries(ctx);
  }
}
