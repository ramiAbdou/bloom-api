import { Response } from 'express';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import MemberRefresh from '../../member-refresh/MemberRefresh';
import Member from '../../member/Member';
import User from '../User';

interface RefreshTokenArgs {
  memberId?: string;
  rToken?: string;
  res?: Response;
  user?: User;
  userId?: string;
}

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided. If the refreshing succeeds, the tokenw il
 */
const refreshToken = async ({
  memberId,
  rToken,
  res,
  user,
  userId
}: RefreshTokenArgs): Promise<AuthTokens> => {
  const bm = new BloomManager();

  if (user) bm.em.merge(user);
  else if (userId) user = await bm.findOne(User, { id: userId });
  else if (rToken) user = await bm.findOne(User, { refreshToken: rToken });

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  await user.members.init();

  const member: Member = memberId
    ? user.members.getItems().find(({ id }) => id === memberId)
    : user.members[0];

  await bm.em.populate(member, 'community');
  const communityId = member.community.id;

  const tokens = generateTokens({
    communityId,
    memberId: member.id,
    userId: user.id
  });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;

  bm.create(MemberRefresh, { member });
  await bm.flush('REFRESH_TOKEN_UPDATED');

  return tokens;
};

export default refreshToken;
