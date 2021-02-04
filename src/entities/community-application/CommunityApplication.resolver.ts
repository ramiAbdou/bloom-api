import { Arg, Query, Resolver } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityApplication from './CommunityApplication';

@Resolver()
export default class CommunityApplicationResolver {
  @Query(() => CommunityApplication, { nullable: true })
  async getApplication(
    @Arg('urlName') urlName: string
  ): Promise<CommunityApplication> {
    return new BloomManager().findOneOrFail(
      CommunityApplication,
      { community: { urlName } },
      {
        cacheKey: `${QueryEvent.GET_APPLICATION}-${urlName}`,
        populate: ['community.integrations']
      }
    );
  }
}
