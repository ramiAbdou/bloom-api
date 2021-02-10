import { Response } from 'express';
import { FilterQuery } from '@mikro-orm/core';

import { AuthTokens } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { generateTokens, setHttpOnlyTokens } from '@util/util';
import MemberRefresh from '../../member-refresh/MemberRefresh';
// import Member from '../../member/Member';
import User from '../User';

interface RefreshTokenArgs {
  email?: string;
  memberId?: string;
  rToken?: string;
  res?: Response;
  userId?: string;
}

/**
 * Refreshes the user's tokens and sets the HTTP only cookies if Express
 * res object is provided. If the refreshing succeeds, the tokenw il
 */
const refreshToken = async ({
  email,
  // memberId,
  rToken,
  res,
  userId
}: RefreshTokenArgs): Promise<AuthTokens> => {
  let args: FilterQuery<User>;

  if (userId) args = { id: userId };
  else if (email) args = { email };
  else if (rToken) args = { refreshToken: rToken };

  const bm = new BloomManager();

  const user: User = await bm.findOne(User, args, {
    populate: ['member.community']
  });

  // If no user found with the given arguments or a user is found and
  // the access token is expired, then exit. Also, if there is a loginToken
  // present, then we verify that before proceeding.
  if (!user?.id) return null;

  if (!user.member) {
    await bm.em.populate(user, ['members.community']);
    const [firstMember] = user.members;
    user.member = firstMember;
  }

  const tokens = generateTokens({
    communityId: user.member.community.id,
    memberId: user.member.id,
    userId: user.id
  });

  // If an Express Response object is passed in, set the HTTP only cookies.
  if (res) setHttpOnlyTokens(res, tokens);

  // Update the refreshToken in the DB, and create a refresh entity.
  user.refreshToken = tokens.refreshToken;

  bm.create(MemberRefresh, { member: user.member });
  await bm.flush({ event: 'REFRESH_TOKEN_UPDATED' });

  return tokens;
};

export default refreshToken;
