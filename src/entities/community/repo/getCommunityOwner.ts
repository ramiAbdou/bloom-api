import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import Community from '../Community';

@ArgsType()
export class GetCommunityOwnerArgs {
  @Field()
  communityId: string;
}

const getCommunityOwner = async ({
  communityId
}: GetCommunityOwnerArgs): Promise<Community> => {
  const community: Community = await new BloomManager().findOne(
    Community,
    { id: communityId },
    {
      cacheKey: `${QueryEvent.GET_OWNER}-${communityId}`,
      populate: ['owner.user']
    }
  );

  return community;
};

export default getCommunityOwner;
