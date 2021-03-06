import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import Application from '../Application';

@ArgsType()
export class GetApplicationArgs {
  @Field()
  communityId: string;
}

/**
 * Returns the Application.
 *
 * @param args.communityId - ID of the Community.
 */
const getApplication = async (
  args: GetApplicationArgs
): Promise<Application> => {
  const { communityId } = args;

  const application: Application = await new BloomManager().findOneOrFail(
    Application,
    { community: communityId },
    { cacheKey: `${QueryEvent.GET_APPLICATION}-${communityId}` }
  );

  return application;
};

export default getApplication;
