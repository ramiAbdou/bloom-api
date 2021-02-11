import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';
import User from '../User';

interface SwitchMemberArgs {
  email?: string;
  memberId: string;
  rToken?: string;
  userId?: string;
}

const switchMember = async ({
  email,
  memberId,
  rToken,
  userId
}: SwitchMemberArgs): Promise<User> => {
  let args: FilterQuery<User>;

  if (userId) args = { id: userId };
  else if (email) args = { email };
  else if (rToken) args = { refreshToken: rToken };

  const bm = new BloomManager();

  const [member, user]: [Member, User] = await Promise.all([
    bm.findOne(Member, { id: memberId }, { populate: ['community'] }),
    bm.findOne(User, args, { populate: ['member.community'] })
  ]);

  if (member) user.member = member;
  else if (!user.member) {
    await bm.em.populate(user, ['members']);
    user.member = user.members[0];
  }

  await bm.flush({ event: 'SWITCH_MEMBER' });

  return user;
};

export default switchMember;
