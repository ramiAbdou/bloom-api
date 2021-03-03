import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import CommunityApplication from '../CommunityApplication';

@ArgsType()
export class GetApplicationArgs {
  @Field()
  urlName: string;
}

const getApplication = async ({ urlName }: GetApplicationArgs) => {
  return new BloomManager().findOneOrFail(
    CommunityApplication,
    { community: { urlName } },
    {
      cacheKey: `${QueryEvent.GET_APPLICATION}-${urlName}`,
      populate: ['community.integrations']
    }
  );
};

export default getApplication;
