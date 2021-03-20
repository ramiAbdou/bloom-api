import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import Community from '../Community';

@ArgsType()
export class GetCommunitiesArgs {
  @Field({ nullable: true })
  userId?: string;
}

/**
 * Returns the Community(s).
 *
 * @param args.userId - ID of the User.
 */
const getCommunities = async (
  args: GetCommunitiesArgs
): Promise<Community[]> => {
  const { userId } = args;

  const communities: Community[] = await new BloomManager().find(
    Community,
    { members: { user: userId } },
    { cacheKey: `${QueryEvent.GET_COMMUNITIES}-${userId}` }
  );

  return communities;
};

export default getCommunities;
