import { Args, Query, Resolver } from 'type-graphql';

import CommunityApplication from './CommunityApplication';
import getApplication, { GetApplicationArgs } from './repo/getApplication';

@Resolver()
export default class CommunityApplicationResolver {
  @Query(() => CommunityApplication, { nullable: true })
  async getApplication(
    @Args() args: GetApplicationArgs
  ): Promise<CommunityApplication> {
    return getApplication(args);
  }
}
