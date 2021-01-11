import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import refreshToken from './refreshToken';

@ArgsType()
export class ChangeCommunityArgs {
  @Field()
  memberId: string;
}

const changeCommunity = async (
  { memberId }: ChangeCommunityArgs,
  { res, userId }: GQLContext
) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  await refreshToken({ memberId, res, userId });
};

export default changeCommunity;
