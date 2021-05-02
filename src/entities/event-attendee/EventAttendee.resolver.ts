import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { TimeSeriesData } from '@util/constants.gql';
import { HasuraRole } from '../../integrations/hasura/Hasura.types';
import getEventAttendeesSeries from './repo/getEventAttendeesSeries';

@Resolver()
export default class EventAttendeeResolver {
  @Authorized(HasuraRole.ADMIN)
  @Query(() => [TimeSeriesData])
  async getEventAttendeesSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getEventAttendeesSeries(ctx);
  }
}
