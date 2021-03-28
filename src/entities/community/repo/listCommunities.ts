import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import Community from '../Community';

@ArgsType()
export class ListCommunitiesArgs {
  @Field({ nullable: true })
  userId?: string;
}

/**
 * Returns the Community(s).
 *
 * @param args.userId - ID of the User.
 */
const listCommunities = async (
  args: ListCommunitiesArgs
): Promise<Community[]> => {
  const { userId } = args;

  const communities: Community[] = await new BloomManager().find(
    Community,
    { members: { user: userId } },
    { cacheKey: `${QueryEvent.LIST_COMMUNITIES}-${userId}` }
  );

  return communities;
};

export default listCommunities;
