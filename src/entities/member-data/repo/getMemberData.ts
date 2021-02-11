import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { MemberIdArgs } from '../../member/Member.types';
import MemberData from '../MemberData';

const getMemberData = async (
  args: MemberIdArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberData[]> => {
  const memberId: string = args?.memberId ?? ctx?.memberId;

  return new BloomManager().find(
    MemberData,
    { member: { id: memberId } },
    { cacheKey: `${QueryEvent.GET_MEMBER_DATA}-${memberId}` }
  );
};

export default getMemberData;
