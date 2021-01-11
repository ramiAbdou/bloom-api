import { Field, ObjectType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../User';

@ObjectType()
export class GetUserResult extends User {
  @Field()
  activeCommunityId?: string;
}

const getUser = async ({
  communityId,
  userId
}: GQLContext): Promise<GetUserResult> => {
  const user: GetUserResult = await new BloomManager().findOne(
    User,
    { id: userId },
    {
      cacheKey: `${QueryEvent.GET_USER}-${userId}`,
      populate: [
        'members.community.integrations',
        'members.community.types',
        'members.type'
      ]
    }
  );

  user.activeCommunityId = communityId;
  return user;
};

export default getUser;
