import { ArgsType, Field, ObjectType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities/entities';
import User from '../User';
import refreshToken from './refreshToken';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  urlName?: string;
}

@ObjectType()
export class GetUserResult extends User {
  @Field()
  activeCommunityId?: string;
}

const getUser = async (
  { urlName }: GetUserArgs,
  ctx: GQLContext
): Promise<GetUserResult> => {
  const { communityId, res, userId } = ctx;

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

  if (!user) return null;

  user.activeCommunityId = communityId;

  if (urlName) {
    const member: Member = user.members
      .getItems()
      .find(({ community }) => community.urlName === urlName);

    if (member && communityId !== member.community.id) {
      await refreshToken({ memberId: member.id, res, userId });
      user.activeCommunityId = member.community.id;
    }
  }

  return user;
};

export default getUser;
