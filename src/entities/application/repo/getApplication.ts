import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import Application from '../Application';

@ArgsType()
export class GetApplicationArgs {
  @Field()
  urlName: string;
}

const getApplication = async (args: GetApplicationArgs) => {
  const application: Application = await new BloomManager().findOneOrFail(
    Application,
    { community: { urlName: args.urlName } },
    {
      cacheKey: `${QueryEvent.GET_APPLICATION}-${args.urlName}`,
      populate: ['community.integrations']
    }
  );

  return application;
};

export default getApplication;
