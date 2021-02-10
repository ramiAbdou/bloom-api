import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
// import { Member } from '@entities/entities';
import User from '../User';
// import refreshToken from './refreshToken';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  urlName?: string;
}

const getUser = async (
  { urlName }: GetUserArgs,
  {
    communityId,
    // res,
    userId
  }: Pick<GQLContext, 'communityId' | 'res' | 'userId'>
): Promise<User> => {
  console.log(communityId, userId);

  const user: User = await new BloomManager().findOneOrFail(
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

  // user.activeCommunityId = communityId;

  // if (urlName) {
  //   const member: Member = user.members
  //     .getItems()
  //     .find(({ community }) => community.urlName === urlName);

  //   if (member && communityId !== member.community.id) {
  //     await refreshToken({ memberId: member.id, res, userId });
  //     // user.activeCommunityId = member.community.id;
  //   }
  // }

  return user;
};

export default getUser;
