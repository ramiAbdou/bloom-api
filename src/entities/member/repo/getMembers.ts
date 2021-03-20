import { ArgsType, Field } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import { take } from '@util/util';
import Member, { MemberStatus } from '../Member';

@ArgsType()
export class GetMembersArgs {
  @Field({ nullable: true })
  communityId: string;

  @Field({ nullable: true })
  memberId: string;

  @Field({ nullable: true })
  userId: string;
}

/**
 * Returns the Member(s).
 *
 * @param args.communityId - ID of the Community.
 * @param args.memberId - ID of the Member.
 * @param args.userId - ID of the User.
 */
const getMembers = async (args: GetMembersArgs): Promise<Member[]> => {
  const { communityId, memberId, userId } = args;

  const queryArgs: FilterQuery<Member> = take([
    [communityId, { community: communityId }],
    [memberId, { id: memberId }],
    [userId, { user: userId }]
  ]);

  const members: Member[] = await new BloomManager().find(
    Member,
    // @ts-ignore b/c not sure why the TS error appears.
    { ...queryArgs, status: MemberStatus.ACCEPTED },
    {
      cacheKey: communityId
        ? `${QueryEvent.GET_MEMBERS}-${communityId}`
        : `${QueryEvent.GET_MEMBERS}-${userId}`,
      orderBy: { createdAt: QueryOrder.DESC, updatedAt: QueryOrder.DESC },
      populate: userId ? ['community'] : []
    }
  );

  return members;
};

export default getMembers;
